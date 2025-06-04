from dotenv import load_dotenv
import os
import requests
import time
from http import HTTPStatus

load_dotenv()

API_KEY = os.getenv("QWEN_API_KEY")
BASE_URL = "https://dashscope-intl.aliyuncs.com/api/v1"

def create_video_task(first_frame_url, last_frame_url, prompt):
    """Create a video generation task"""
    url = f"{BASE_URL}/services/aigc/image2video/video-synthesis"
    
    headers = {
        "X-DashScope-Async": "enable",
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "wan2.1-kf2v-plus",
        "input": {
            "first_frame_url": first_frame_url,
            "last_frame_url": last_frame_url,
            "prompt": prompt
        },
        "parameters": {
            "resolution": "720P",
            "prompt_extend": True
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == HTTPStatus.OK:
        return response.json()["output"]["task_id"]
    else:
        raise Exception(f"Failed to create task: {response.text}")

def get_task_result(task_id):
    """Get the result of a video generation task"""
    url = f"{BASE_URL}/tasks/{task_id}"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    
    while True:
        response = requests.get(url, headers=headers)
        if response.status_code == HTTPStatus.OK:
            result = response.json()
            status = result["output"]["task_status"]
            
            if status == "SUCCEEDED":
                return result["output"]["video_url"]
            elif status in ["FAILED", "CANCELED"]:
                raise Exception(f"Task failed with status: {status}")
            
            print(f"Task status: {status}, waiting...")
            time.sleep(30)  # Wait 30 seconds before checking again
        else:
            raise Exception(f"Failed to get task result: {response.text}")

def generate_video(first_frame_url, last_frame_url, prompt):
    """Generate a video from first and last frames"""
    print("Creating video generation task...")
    task_id = create_video_task(first_frame_url, last_frame_url, prompt)
    
    print("Waiting for video generation to complete...")
    video_url = get_task_result(task_id)
    
    print(f"Video generation completed! URL: {video_url}")
    return video_url

if __name__ == "__main__":
    # Example usage
    first_frame = "https://wanx.alicdn.com/material/20250318/first_frame.png"
    last_frame = "https://wanx.alicdn.com/material/20250318/last_frame.png"
    prompt = "Realistic style, a black kitten curiously looking at the sky, the camera gradually rises from eye level, finally looking down at the kitten's curious eyes."
    
    try:
        video_url = generate_video(first_frame, last_frame, prompt)
    except Exception as e:
        print(f"Error: {e}")
