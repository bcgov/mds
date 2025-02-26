import json
import queue
import threading
from pathlib import Path
from typing import Iterator

from app.common.streaming.sync_callback import (
    SyncStreamingCallback,  # Import the new callback
)
from app.helpers.temporary_file import store_temporary
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    IndexStats,
    SearchParams,
)
from app.pipelines.permit_condition_search.permit_condition_search_pipeline import (
    permit_condition_search_indexing_pipeline,
    permit_condition_search_retrieval_pipeline,
)
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

router = APIRouter()

import logging

logger = logging.getLogger(__name__)


@router.post("/permit_conditions/search/index")
async def index_permit_conditions(file: UploadFile = File(...)) -> IndexingResponse:
    """
    Asynchronously indexes permit conditions from the given CSV file by uploading it to blob storage
    and running the Azure Search indexer.

    Args:
        file (UploadFile): The CSV file containing permit conditions to index.

    Returns:
        IndexingResponse: Status of the indexing job including statistics.

    Raises:
        HTTPException: If file type is invalid or processing fails.
    """
    if file.content_type != "text/csv":
        raise HTTPException(
            400, detail="Invalid file type. Only CSV files are supported."
        )

    # Write the uploaded file to a temporary file
    tmp = store_temporary(file, suffix=".csv")

    try:
        pipeline = permit_condition_search_indexing_pipeline
        logger.info(f"Starting indexing pipeline for file {file.filename}")

        res = pipeline.run({"blob_uploader": {"file_path": Path(tmp.name)}})
        logger.debug(f"Pipeline response: {res}")

        return IndexingResponse(
            id="",
            status=res["indexer_runner"]["status"],
            stats=(
                IndexStats(**res["indexer_runner"]["stats"])
                if "stats" in res["indexer_runner"]
                else None
            ),
        )

    except Exception as e:
        logger.error(f"Error during indexing: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Error during indexing: {str(e)}")

    finally:
        tmp.close()


def create_stream_generator(params: SearchParams) -> Iterator[bytes]:
    """
    Creates a generator that executes the pipeline and yields SSE formatted results.
    This approach doesn't rely on async/await or background tasks.
    """
    # Create queue for communication between threads
    event_queue = queue.Queue()
    # Add a flag to track if the stream has ended
    stream_completed = threading.Event()

    # Create function to add events to queue with custom ENDMESSAGE delimiter
    def add_event(event_type, data):
        # Format with explicit custom delimiter to ensure proper parsing
        event_text = f"event: {event_type}\ndata: {data}\nENDMESSAGE"
        logger.debug(f"Adding event: {event_type} (length: {len(event_text)})")
        event_queue.put(event_text)

    # Create function to handle LLM tokens
    def token_handler(token: str):
        try:
            event_queue.put(f"event: token\ndata: {token}\nENDMESSAGE")
        except Exception as e:
            logger.error(f"Error in token handler: {str(e)}")

    # Send a keep-alive comment at the beginning
    event_queue.put(": keep-alive\nENDMESSAGE")

    # Signal start of stream
    add_event("status", json.dumps({"message": "Starting search..."}))

    # Function to run in separate thread
    def run_pipeline():
        try:
            logger.info(f"Executing pipeline for query: {params.query}")

            # Create our picklable sync callback
            streaming_callback = SyncStreamingCallback(token_handler)

            # Simple stream handler to put events in queue
            class QueueStream:
                def add_event(self, event_type, data):
                    logger.debug(f"Adding event: {event_type}")
                    add_event(event_type, data)

                def add_llm_token(self, token):
                    token_handler(token)

                def end_stream(self):
                    logger.info("Stream end signal received")
                    add_event("complete", json.dumps({"message": "Search completed"}))
                    # Set the completion flag
                    stream_completed.set()
                    # Add None to signal end of queue
                    event_queue.put(None)

            # Create stream handler
            stream_handler = QueueStream()

            try:
                result = permit_condition_search_retrieval_pipeline.run(
                    {
                        "text_embedder": {"text": params.query},
                        "retriever": {"query": params.query, "filters": params.filters},
                        "prompt_builder": {"question": params.query},
                        "llm": {"streaming_callback": streaming_callback},
                        "document_result_streamer": {"stream": stream_handler},
                        "llm_result_streamer": {"stream": stream_handler},
                    }
                )
                logger.info("Pipeline execution completed successfully")
                # Always ensure stream is ended after pipeline completes
                logger.info("Pipeline completed, ending stream")
                stream_handler.end_stream()

            except Exception as e:
                logger.exception(f"Pipeline execution failed: {str(e)}")
                add_event("error", json.dumps({"message": f"Search failed: {str(e)}"}))
                event_queue.put(None)  # Signal end of queue
                stream_completed.set()  # Make sure to set completion in error case too
        except Exception as e:
            logger.exception(f"Thread execution failed: {str(e)}")
            add_event(
                "error", json.dumps({"message": f"Search setup failed: {str(e)}"})
            )
            event_queue.put(None)  # Signal end of queue
            stream_completed.set()  # Set completion in outer error case

    # Start pipeline in a separate thread
    thread = threading.Thread(target=run_pipeline)
    thread.daemon = True
    thread.start()

    # Start a watchdog thread to automatically end the stream after a timeout
    def watchdog():
        # Wait up to 10 minutes for completion
        if not stream_completed.wait(600):
            logger.error("Stream watchdog timeout - forcing stream end")
            event_queue.put(
                f"event: error\ndata: {json.dumps({'message': 'Search timed out'})}\nENDMESSAGE".encode(
                    "utf-8"
                )
            )
            event_queue.put(None)  # Signal end

    watchdog_thread = threading.Thread(target=watchdog)
    watchdog_thread.daemon = True
    watchdog_thread.start()

    # Stream results from queue
    try:
        while True:
            try:
                event = event_queue.get(timeout=30)  # 30-second timeout for each event
                if event is None:  # End of stream signal
                    logger.info(
                        "End of stream signal received, breaking generator loop"
                    )
                    break
                logger.debug(f"Yielding event ({len(event)} bytes)")
                # Use raw bytes to ensure format is preserved
                yield event.encode("utf-8")
            except queue.Empty:
                if stream_completed.is_set():
                    logger.info("Queue is empty and stream is completed, ending stream")
                    break
                logger.warning(
                    "Queue timeout but stream not completed, waiting for more events..."
                )
                # Continue waiting if stream isn't marked as completed
                continue
    finally:
        logger.info("Stream generator exiting")


@router.post("/permit_conditions/search")
async def search_permit_conditions(params: SearchParams) -> StreamingResponse:
    """Search permit conditions and stream results."""
    logger.info(f"Received search request: {params.query}")

    # Add debug logging
    logger.debug("Creating streaming response")

    return StreamingResponse(
        create_stream_generator(params),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )
