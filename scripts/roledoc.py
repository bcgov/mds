import ast
import os
import sys

def find_decorated_functions(folder_path, decorator_name):
    results = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if not file.endswith(".py"):
                continue
            file_path = os.path.join(root, file)
            with open(file_path) as f:
                tree = ast.parse(f.read())

            for class_node in tree.body:
                if not isinstance(class_node, ast.ClassDef):
                    continue

                for function_node in class_node.body:
                    if not isinstance(function_node, ast.FunctionDef):
                        continue

                    for decorator_node in function_node.decorator_list:
                        if not isinstance(decorator_node, ast.Call):
                            continue

                        if not isinstance(decorator_node.func, ast.Name):
                            continue

                        if decorator_node.func.id != decorator_name:
                            continue

                        args = []
                        for arg_node in decorator_node.args:
                            if isinstance(arg_node, ast.List):
                                items = [item.id for item in arg_node.elts if isinstance(item, ast.Name)]
                                args.extend(items)
                            elif isinstance(arg_node, ast.Name):
                                args.append(arg_node.id)

                        result = {
                            "class_name": class_node.name,
                            "function_name": function_node.name,
                            "args": args
                        }
                        results.append(result)

        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            find_decorated_functions(dir_path, decorator_name)

    return results


if len(sys.argv) != 2:
    print("Usage: python script.py path/to/folder")
    sys.exit(1)

folder_path = sys.argv[1]
decorator_name = "requires_any_of"

results = find_decorated_functions(folder_path, decorator_name)

# Group the results by class name
grouped_results = {}
for result in results:
    class_name = result["class_name"]
    if class_name not in grouped_results:
        grouped_results[class_name] = []
    grouped_results[class_name].append(result)

# Print the output
for class_name, class_results in grouped_results.items():
    print(class_name)
    for result in class_results:
        print(f"  {result['function_name']}: {result['args']}")
