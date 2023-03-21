import dotenv from "dotenv";
import Discord from "discord.js";
import { Configuration, OpenAIApi } from "openai";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = "!";

const messagesToText = (messages) => {
  return `${messages.map((message) => `${message.author}: ${message.content}`).join("\n")}`;
};

const generateSummary = async (text) => {
  const prompt = `${text}\n\n: Generate a summary with the following sections: 1) list of blockers, 2)who needs help or assitance, 3)find any team members who potentially need to meet with each other, the scrum updates from all team members are posted above `;
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 512,
      n: 1,
      stop: null,
      temperature: 0.8,
    });

    return completion.data.choices[0].text.trim();
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(PREFIX)) return;

  const [command, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/);

  if (command === "summarize") {
    console.log("====================================");
    // Fetch messages since the morning of the current day in PST
    const now = new Date();
    now.setHours(now.getHours() - 8); // Convert to PST by subtracting 8 hours
    const fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const channel = await client.channels.fetch("1085636111377903748");

    try {
      const scrumMessages = await fetchMessages(channel, fromDate);
      const text = messagesToText(scrumMessages);
      console.log(text);
      const summary = await generateSummary(text);
      console.log(summary);
    } catch (error) {
      console.error(error);
    }
    console.log("====================================");
  }
});

async function fetchMessages(channel, fromDate) {
  let shouldFetch = true;
  let beforeMessage = undefined;
  const scrumMessages = [];
  while (shouldFetch) {
    const options = { limit: 100 };
    if (beforeMessage) {
      options.before = beforeMessage;
    }

    const messages = await channel.messages.fetch(options);
    if (!messages.size) {
      shouldFetch = false;
      break;
    }

    messages.forEach((message) => {
      if (message.createdAt > fromDate) {
        scrumMessages.push({
          author: message.author.username,
          content: message.content,
        });
      } else {
        shouldFetch = false;
      }
    });

    beforeMessage = messages.last();
  }
  return scrumMessages;
}

client.login(process.env.DISCORD_TOKEN);
