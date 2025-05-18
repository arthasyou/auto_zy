import json
import os

DATA_DIR = "./data/扩写语料"
OUTPUT_DIR = "./output"
ORIGINAL_CASE_DIR = "./data/原始医案"


def read_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def collect_knowledge_points(case_id, case_dir):
    knowledge_points = []
    for filename in sorted(os.listdir(case_dir)):
        if filename.endswith(".md"):
            file_path = os.path.join(case_dir, filename)
            content = read_file(file_path)
            point_id = f"{case_id}-{filename.split('.')[0].replace('知识点', '')}"
            knowledge_points.append(
                {"id": point_id, "title": filename, "content": content}
            )
    return knowledge_points


def generate_json():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for case_folder in os.listdir(DATA_DIR):
        case_dir = os.path.join(DATA_DIR, case_folder)
        case_id = case_folder.replace("医案", "")
        original_case_path = os.path.join(ORIGINAL_CASE_DIR, f"原始医案{case_id}.md")

        if os.path.exists(original_case_path):
            case_content = read_file(original_case_path)
            knowledge_points = collect_knowledge_points(case_id, case_dir)

            output_data = {
                "id": case_id,
                "case": case_content,
                "knowledge_points": knowledge_points,
            }

            output_file = os.path.join(OUTPUT_DIR, f"知识点{case_id}.json")
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(output_data, f, ensure_ascii=False, indent=4)

            print(f"Generated {output_file}")


if __name__ == "__main__":
    generate_json()
