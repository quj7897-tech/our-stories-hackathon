#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""把图片帧序列合成 MP4。

用法:
    python encode_video.py                          # 自动选最新的 render_frames_* 目录
    python encode_video.py --frames <dir> --out 名字.mp4 --fps 30 --crf 19
"""
import argparse
import glob
import os
import subprocess
import shutil
import sys


def get_ffmpeg():
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if os.path.exists(exe):
            return exe
    except Exception:
        pass
    configured = os.environ.get("FFMPEG_PATH")
    if configured and os.path.isfile(configured):
        return configured
    return shutil.which("ffmpeg")


def latest_frames_dir(prefer_scene=None):
    cands = glob.glob("render_frames_*")
    if prefer_scene is not None:
        cands = [d for d in cands if ("_s%s_" % prefer_scene) in d] or cands
    cands = [d for d in cands if os.path.isdir(d)]
    if not cands:
        return None
    return max(cands, key=os.path.getctime)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--frames", help="帧目录（默认自动选最新的 render_frames_*）")
    ap.add_argument("--out", default="output.mp4")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--crf", type=int, default=19)
    ap.add_argument("--scene", help="偏向选择某个场景编号的帧目录")
    args = ap.parse_args()

    frames = args.frames or latest_frames_dir(args.scene)
    if not frames or not os.path.isdir(frames):
        print("找不到帧目录：", frames)
        sys.exit(1)

    ff = get_ffmpeg()
    if not ff:
        print("找不到 ffmpeg，请先 pip install imageio-ffmpeg")
        sys.exit(1)

    pattern = os.path.join(frames, "f_%05d.jpg")
    cmd = [
        ff, "-y", "-framerate", str(args.fps), "-i", pattern,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", str(args.crf),
        "-preset", "medium", "-movflags", "+faststart", args.out,
    ]
    print("帧目录:", frames)
    subprocess.run(cmd, check=False)
    if os.path.exists(args.out):
        print("已输出:", args.out, "%.1f MB" % (os.path.getsize(args.out) / 1024 / 1024))
        subprocess.run([ff, "-i", args.out], capture_output=True)
    else:
        print("编码失败")


if __name__ == "__main__":
    main()
