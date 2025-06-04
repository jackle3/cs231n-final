from dotenv import load_dotenv
import os
from http import HTTPStatus
from dashscope import VideoSynthesis
import dashscope

load_dotenv()

dashscope.api_key = os.getenv("QWEN_API_KEY")
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"


def sample_call_i2v():
    # call sync api, will return the result
    print("please wait...")
    rsp = VideoSynthesis.call(
        model="wan2.1-i2v-turbo",
        prompt="a cat running on the grass",
        img_url="https://cdn.translate.alibaba.com/r/wanx-demo-1.png",
    )
    print(rsp)
    if rsp.status_code == HTTPStatus.OK:
        print(rsp.output.video_url)
    else:
        print("Failed, status_code: %s, code: %s, message: %s" % (rsp.status_code, rsp.code, rsp.message))


if __name__ == "__main__":
    sample_call_i2v()
