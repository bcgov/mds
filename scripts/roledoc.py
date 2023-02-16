import ast
import os
import sys

def find_decorated_functions(folder_path, decorator_names):
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
                        if isinstance(decorator_node, ast.Call):
                            if not isinstance(decorator_node.func, ast.Name):
                                continue

                            if decorator_node.func.id not in decorator_names:
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
                                "decorator_name": decorator_node.func.id,
                                "args": args
                            }
                            results.append(result)
                        elif isinstance(decorator_node, ast.Name):
                            if decorator_node.id not in decorator_names:
                                continue

                            result = {
                                "class_name": class_node.name,
                                "function_name": function_node.name,
                                "decorator_name": decorator_node.id,
                                "args": []
                            }
                            results.append(result)

        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            find_decorated_functions(dir_path, decorator_names)

    return results


# List of decorators to search for
decorator_names = ["is_minespace_user",
    "can_edit_now_dates",
    "can_edit_mines",
    "requires_role_edit_emli_contacts",
    "requires_role_edit_project_summaries",
    "requires_role_edit_incidents",
    "requires_role_view_all",
    "requires_role_mine_edit",
    "requires_role_mine_admin",
    "requires_role_edit_party",
    "requires_role_edit_permit",
    "requires_role_edit_explosives_permit",
    "requires_role_edit_standard_permit_conditions",
    "requires_role_edit_report",
    "requires_role_edit_do",
    "requires_role_close_permit",
    "requires_role_edit_submissions",
    "requires_role_edit_securities",
    "requires_role_mds_administrative_users",
    "requires_role_edit_now_dates",
    "requires_role_edit_tsf",
    "requires_role_edit_requirements",
    "requires_any_of"]

# Get folder path from command-line argument
if len(sys.argv) < 2:
    print("Usage: python script.py folder_path")
    sys.exit(1)

folder_path = sys.argv[1]

results = find_decorated_functions(folder_path, decorator_names)

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
        if result["args"]:
            args_str = ", ".join(result["args"])
            print(f"  {result['function_name']} ({result['decorator_name']}): {args_str}")
        else:
            print(f"  {result['function_name']} ({result['decorator_name']})")
