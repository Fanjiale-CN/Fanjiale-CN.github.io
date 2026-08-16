#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
import subprocess
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

WIDTH, HEIGHT, FPS, FRAMES = 1920, 1080, 30, 1140
PAPER = '#f7f4ef'
INK = '#171717'
RED = '#9e2a2b'
LINE = '#d8d2c8'
MUTED = '#77736b'
ROOT = Path(__file__).resolve().parents[2]

FONT_DISPLAY = ROOT / 'assets/fonts/floane-bold.ttf'
FONT_TEXT = ROOT / 'assets/fonts/gambetta-400.woff2'
FONT_TEXT_ITALIC = ROOT / 'assets/fonts/gambetta-400i.woff2'
FONT_META = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')

SOURCES = {
    'hangzhou': ROOT / 'assets/be-a-viewer/hangzhou/gallery/03-lake-pavilion-mist.webp',
    'beijing': ROOT / 'assets/be-a-viewer/beijing/imperial-eaves.webp',
    'shanghai': ROOT / 'assets/be-a-viewer/shanghai/bund-monochrome.webp',
    'xian': ROOT / 'assets/be-a-viewer/xian/city-wall-rampart.jpeg',
    'xiamen': ROOT / 'images/xiamen/ferry.webp',
    'data': ROOT / 'assets/editorial/data/household-line-zine.webp',
    'paper': ROOT / 'assets/zine/zine-growth-ref.jpg',
}


def clamp(value: float, low: float = 0, high: float = 1) -> float:
    return max(low, min(high, value))


def ease(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 4


def smooth(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def tween(frame: float, start: float, end: float, a: float = 0, b: float = 1, curve=ease) -> float:
    if end == start:
        return b
    return a + (b - a) * curve((frame - start) / (end - start))


@lru_cache(maxsize=None)
def font(path: str, size: int):
    return ImageFont.truetype(path, size=size)


def f_display(size: int): return font(str(FONT_DISPLAY), size)
def f_text(size: int): return font(str(FONT_TEXT), size)
def f_italic(size: int): return font(str(FONT_TEXT_ITALIC), size)
def f_meta(size: int): return font(str(FONT_META), size)


@lru_cache(maxsize=1)
def paper_base() -> Image.Image:
    base = Image.new('RGB', (WIDTH, HEIGHT), PAPER)
    texture = Image.open(SOURCES['paper']).convert('L')
    texture = ImageOps.fit(texture, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS)
    texture = ImageEnhance.Contrast(texture).enhance(.72).convert('RGB')
    return Image.blend(base, texture, .045)


@lru_cache(maxsize=64)
def photo(name: str, width: int, height: int, dark: int = 0) -> Image.Image:
    source = Image.open(SOURCES[name]).convert('RGB')
    source = ImageOps.fit(source, (width, height), method=Image.Resampling.LANCZOS)
    source = ImageOps.grayscale(source)
    source = ImageEnhance.Contrast(source).enhance(1.10).convert('RGB')
    if dark:
        source = Image.blend(source, Image.new('RGB', source.size, INK), dark / 100)
    return source


def canvas() -> Image.Image:
    return paper_base().copy()


def hairlines(draw: ImageDraw.ImageDraw):
    draw.line((76, 70, 1844, 70), fill=LINE, width=1)
    draw.line((76, 1010, 1844, 1010), fill=LINE, width=1)


def tracked(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, face, fill, spacing: int = 3):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=face, fill=fill)
        box = draw.textbbox((x, y), char, font=face)
        x += box[2] - box[0] + spacing


def meta(draw: ImageDraw.ImageDraw, left: str, right: str):
    tracked(draw, (92, 84), left, f_meta(44), RED, 4)
    box = draw.textbbox((0, 0), right, font=f_meta(44))
    tracked(draw, (1828 - (box[2] - box[0]) - len(right) * 4, 84), right, f_meta(44), INK, 4)


def mark(draw: ImageDraw.ImageDraw, x: int, y: int, size: int, opacity: float = 1):
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    red = (158, 42, 43, round(255 * opacity))
    ink = (23, 23, 23, round(255 * opacity))
    d.rectangle((0, 0, size * .24, size * .51), fill=red)
    d.rectangle((size * .33, 0, size, size * .40), fill=red)
    d.rectangle((0, size * .60, size * .24, size * .84), fill=ink)
    for top in (.48, .63, .78):
        d.rectangle((size * .33, size * top, size, size * (top + .095)), fill=red)
    draw._image.paste(layer, (x, y), layer)


def multiline(draw: ImageDraw.ImageDraw, xy, text, face, fill, spacing=0, anchor=None):
    draw.multiline_text(xy, text, font=face, fill=fill, spacing=spacing, anchor=anchor)


def brand_open(frame: int) -> Image.Image:
    image = canvas(); draw = ImageDraw.Draw(image); hairlines(draw); meta(draw, 'FIELD NOTE / DESIGN LANGUAGE', '00 / A QUIET FIELD')
    cross = tween(frame, 5, 28)
    draw.line((960, 268, 960, 268 + 544 * cross), fill=LINE, width=1)
    draw.line((636, 540, 636 + 648 * cross, 540), fill=LINE, width=1)
    reveal = tween(frame, 24, 52)
    if reveal > .02: mark(draw, 684, round(395 + (1 - reveal) * 12), 132, reveal)
    word = tween(frame, 43, 69)
    if word > .02:
        overlay = Image.new('RGBA', image.size, (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
        od.text((858 + (1 - word) * 20, 378), 'Galok', font=f_display(150), fill=(23, 23, 23, round(255 * word)))
        tracked(od, (858, 546), 'VIEW · FRAME · OBSERVE', f_meta(44), (158, 42, 43, round(255 * word)), 6)
        image.paste(overlay, (0, 0), overlay)
    sub = tween(frame, 64, 84)
    if sub > .02:
        overlay = Image.new('RGBA', image.size, (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
        od.text((684, 920), 'A personal magazine and city memory book.', font=f_italic(40), fill=(119, 115, 107, round(255 * sub)))
        image.paste(overlay, (0, 0), overlay)
    return image


def growth_first(frame: int) -> Image.Image:
    image = canvas(); draw = ImageDraw.Draw(image); hairlines(draw); meta(draw, '01 / PHILOSOPHY', 'GROWTH FIRST')
    seed = tween(frame, 6, 25); roots = tween(frame, 22, 82, curve=smooth); stem = tween(frame, 43, 112, curve=smooth)
    # field baseline
    draw.line((882, 558, 1778, 558), fill=LINE, width=2)
    if seed > .01: draw.ellipse((1320-18*seed, 558-18*seed, 1320+18*seed, 558+18*seed), fill=RED)
    def partial_curve(points, amount, color, width):
        upto = max(2, round(len(points) * amount)); draw.line(points[:upto], fill=color, width=width, joint='curve')
    root1 = [(1320 + int(-20*t - 70*t*t), 558 + int(90*t + 145*t*t)) for t in [i/80 for i in range(81)]]
    root2 = [(1320 + int(22*t + 82*t*t), 558 + int(90*t + 142*t*t)) for t in [i/80 for i in range(81)]]
    stem_path = [(1320, 558 - int(316*t)) for t in [i/80 for i in range(81)]]
    if roots > .01:
        partial_curve(root1, roots, RED, 7); partial_curve(root2, roots, RED, 7)
    if stem > .01:
        partial_curve(stem_path, stem, INK, 8)
        leaf = tween(stem, .46, .92)
        if leaf > .01:
            draw.arc((1184, 296, 1325, 454), start=210, end=330, fill=INK, width=6)
            draw.arc((1314, 250, 1470, 420), start=25, end=148, fill=INK, width=6)
    title = tween(frame, 76, 104)
    if title > .02:
        layer = Image.new('RGBA', image.size, (0,0,0,0)); d = ImageDraw.Draw(layer)
        multiline(d, (92, 286 + (1-title)*22), 'Growth\ncomes first.', f_display(116), (23,23,23,round(255*title)), spacing=-8)
        image.paste(layer,(0,0),layer)
    note = tween(frame, 98, 124)
    if note > .02:
        layer = Image.new('RGBA', image.size, (0,0,0,0)); d=ImageDraw.Draw(layer)
        multiline(d,(92, 588),'The field sets the form.\nDesign serves what it finds.',f_text(42),(119,115,107,round(255*note)),spacing=9)
        image.paste(layer,(0,0),layer)
    return image


def relay_position(frame: int) -> float:
    if frame < 64: return 0
    if frame < 82: return tween(frame, 64, 82, 0, 1, smooth)
    if frame < 132: return 1
    if frame < 150: return tween(frame, 132, 150, 1, 2, smooth)
    return 2


def word_relay(frame: int) -> Image.Image:
    image = canvas(); draw=ImageDraw.Draw(image); hairlines(draw); meta(draw,'02 / THREE LENSES','ONE MEASURED STEP')
    position = relay_position(frame); enter = tween(frame,4,24)
    x,y,w,h = 92,216,710,730
    if enter > .02:
        strip = Image.new('RGB',(w,1890),PAPER); sd=ImageDraw.Draw(strip)
        entries=[('beijing','BEIJING'),('shanghai','SHANGHAI'),('hangzhou','HANGZHOU')]
        for index,(name,city) in enumerate(entries):
            top=index*630; strip.paste(photo(name,w,630), (0,top))
            shade=Image.new('RGBA',(w,220),(0,0,0,0)); shd=ImageDraw.Draw(shade)
            for row in range(220): shd.line((0,row,w,row),fill=(23,23,23,round(170*row/220)))
            strip.paste(shade,(0,top+410),shade)
            tracked(sd,(26,top+562),f'0{index+1} / {city}',f_meta(44),PAPER,3)
            sd.line((0,top+629,w,top+629),fill=INK,width=1)
        crop_top=round(position*630)
        image.paste(strip.crop((0,crop_top,w,crop_top+630)),(x,y))
        draw.rectangle((x,y,x+w,y+630),outline=INK,width=1)
        draw.rectangle((x,y+630,x+w,y+h),fill=PAPER,outline=INK,width=1)
        tracked(draw,(x+26,y+656),'GALOK / NOTES',f_meta(44),INK,3)
        tracked(draw,(x+620,y+656),f'0{round(position)+1}',f_meta(44),RED,3)
    tracked(draw,(920,288),'VIEW · FRAME · OBSERVE',f_meta(44),RED,5)
    words=[('VIEW','See the whole field.'),('FRAME','Choose what matters.'),('OBSERVE','Stay until it answers.')]
    for index,(verb,line) in enumerate(words):
        distance=abs(position-index); visible=smooth(1-min(1,distance*2.6))
        if visible>.02:
            layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer); off=(index-position)*120
            d.text((920,376+off),verb,font=f_display(142),fill=(23,23,23,round(255*visible)))
            d.text((920,590+off),line,font=f_italic(50),fill=(119,115,107,round(255*visible)))
            image.paste(layer,(0,0),layer)
    draw.line((920,820,1828,820),fill=LINE,width=1)
    return image


def scan_frame(frame: int) -> Image.Image:
    image=canvas(); draw=ImageDraw.Draw(image); meta(draw,'03 / FRAME','A CROP IS A CLAIM')
    x,y,w,h=92,180,1550,760; base=photo('hangzhou',w,h)
    scan=tween(frame,12,102,curve=lambda v:clamp(v)); scan_x=round(scan*w)
    dark=Image.blend(base,Image.new('RGB',base.size,INK),.48)
    plate=dark.copy(); plate.paste(base.crop((0,0,scan_x,h)),(0,0)); image.paste(plate,(x,y)); draw.rectangle((x,y,x+w,y+h),outline=INK,width=1)
    draw.line((x+scan_x,y,x+scan_x,y+h),fill=RED,width=3)
    annotate=tween(frame,92,120)
    if annotate>.02:
        ax,ay,aw,ah=912,348,470,370; length=58; width=max(1,round(3*annotate))
        for points in [((ax,ay+length),(ax,ay),(ax+length,ay)),((ax+aw-length,ay),(ax+aw,ay),(ax+aw,ay+length)),((ax,ay+ah-length),(ax,ay+ah),(ax+length,ay+ah)),((ax+aw-length,ay+ah),(ax+aw,ay+ah),(ax+aw,ay+ah-length))]: draw.line(points,fill=RED,width=width,joint='curve')
        draw.rectangle((800,724,1382,798),fill=RED); tracked(draw,(820,734),'FRAME 04 / WATER',f_meta(44),PAPER,2)
    caption=tween(frame,112,142)
    if caption>.02:
        layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer); ox=(1-caption)*22
        multiline(d,(1500+ox,296),'A crop\nis a claim.',f_display(80),(23,23,23,round(255*caption)),spacing=-8)
        multiline(d,(1500+ox,542),'This matters.\nThat can wait.',f_text(46),(119,115,107,round(255*caption)),spacing=6)
        image.paste(layer,(0,0),layer)
    return image


def observe_scene(frame: int) -> Image.Image:
    image=canvas(); draw=ImageDraw.Draw(image); hairlines(draw); meta(draw,'04 / OBSERVE','STAY WITH THE SCENE')
    names=[('xiamen','COAST / WAITING'),('shanghai','FACADE / WEATHER'),('xian','WALL / PASSAGE')]
    x0,y,w,h,gap=92,202,564,590,22
    travel=tween(frame,12,92,curve=smooth); settle=tween(frame,92,124)
    positions=[380,1000,1000]; focus_x=int(positions[0]+(positions[1]-positions[0])*smooth(min(1,travel*1.92)))
    focus_y=int(420+(338-420)*smooth(min(1,travel*1.92)))
    light_layer=Image.new('RGB',image.size,PAPER)
    light_layer.paste(image,(0,0))
    for index,(name,label) in enumerate(names):
        px=x0+index*(w+gap); py=y+(-round(16*settle) if index==1 else 0)
        image.paste(photo(name,w,h,58),(px,py)); light_layer.paste(photo(name,w,h),(px,py))
        draw.rectangle((px,py,px+w,py+h),outline=INK,width=1)
        tracked(draw,(px+18,py+h-64),label,f_meta(44),PAPER,2)
    radius=round(164+92*settle); mask=Image.new('L',image.size,0); md=ImageDraw.Draw(mask); md.ellipse((focus_x-radius,focus_y-radius,focus_x+radius,focus_y+radius),fill=255)
    image.paste(light_layer,(0,0),mask); draw=ImageDraw.Draw(image); draw.ellipse((focus_x-radius,focus_y-radius,focus_x+radius,focus_y+radius),outline=RED,width=3)
    if settle>.02:
        layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
        d.text((92,884),'Stay until the scene answers.',font=f_display(76),fill=(23,23,23,round(255*settle)))
        tracked(d,(1500,904),'HOLD / 05.6',f_meta(44),(158,42,43,round(255*settle)),3)
        image.paste(layer,(0,0),layer)
    return image


def cubic(start, c1, c2, end, t):
    u=1-t
    return (u**3*start[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t**3*end[0],u**3*start[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t**3*end[1])


MERGE=[('CITY',(220,260),(520,260),(640,466),0),('IMAGE',(220,760),(510,760),(650,596),9),('WRITING',(1700,260),(1390,260),(1260,466),18),('DATA',(1700,760),(1400,760),(1260,596),27)]


def merge_scene(frame:int)->Image.Image:
    image=canvas(); draw=ImageDraw.Draw(image); hairlines(draw); meta(draw,'05 / ARCHIVE','ONE FIELD / MANY FORMS'); end=(960,526)
    for label,start,c1,c2,delay in MERGE:
        draw_amount=tween(frame,8+delay,64+delay,curve=smooth); erase=tween(frame,128,156)
        path_start=round(100*erase); path_end=round(100*draw_amount)
        if path_end-path_start >= 2:
            points=[cubic(start,c1,c2,end,i/100) for i in range(path_start,path_end+1)]
            draw.line(points,fill=RED if label=='DATA' else INK,width=3,joint='curve')
        motion=tween(frame,38+delay,112+delay*.35,curve=smooth); point=cubic(start,c1,c2,end,motion); absorb=tween(motion,.78,1)
        label_opacity=1-tween(frame,48+delay,78+delay)
        if label_opacity>.02:
            layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer); lx,ly=start[0]-120,start[1]-98
            d.rectangle((lx-20,ly,lx+260,ly+76),fill=(247,244,239,round(255*label_opacity)),outline=(158,42,43,round(255*label_opacity)) if label=='DATA' else (23,23,23,round(255*label_opacity)),width=1)
            box=d.textbbox((0,0),label,font=f_meta(44)); d.text((start[0]-(box[2]-box[0])/2,ly+15),label,font=f_meta(44),fill=(158,42,43,round(255*label_opacity)) if label=='DATA' else (23,23,23,round(255*label_opacity)))
            image.paste(layer,(0,0),layer); draw=ImageDraw.Draw(image)
        radius=max(0,round(13*(1-absorb))); draw.ellipse((point[0]-radius,point[1]-radius,point[0]+radius,point[1]+radius),fill=RED if label=='DATA' else INK)
    reveal=tween(frame,108,140)
    if reveal>.02: mark(draw,round(960-108*reveal),round(526-108*reveal),round(216*reveal),reveal)
    caption=tween(frame,94,118)
    if caption>.02:
        layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
        d.text((92,880),'One field. Many forms.',font=f_display(80),fill=(23,23,23,round(255*caption)))
        d.text((1370,918),'Everything remains findable.',font=f_italic(34),fill=(119,115,107,round(255*caption)))
        image.paste(layer,(0,0),layer)
    return image


def outro(frame:int)->Image.Image:
    image=canvas(); draw=ImageDraw.Draw(image); hairlines(draw)
    strip=tween(frame,12,54,curve=smooth)
    draw.line((0,144-round(strip*148),1920,144-round(strip*148)),fill=LINE,width=1)
    tracked(draw,(92,84-round(strip*148)),'GALOK / FIELD NOTES',f_meta(44),INK,3)
    panels=[('VIEW','視',92,-1),('FRAME','框',686,1),('OBSERVE','察',1280,1)]
    for index,(name,glyph,x,direction) in enumerate(panels):
        local=tween(frame,20+index*8,68+index*8,curve=smooth); px=round(x+direction*local*760); opacity=1-tween(local,.72,1)
        if opacity>.02:
            layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
            d.rectangle((px,218,px+548,848),fill=(247,244,239,round(255*opacity)),outline=(23,23,23,round(255*opacity)),width=1)
            tracked(d,(px+38,244),f'0{index+1} / {name}',f_meta(44),(158,42,43,round(255*opacity)),3)
            d.text((px+360,246),glyph,font=f_display(108),fill=(216,210,200,round(255*opacity)))
            d.text((px+38,734),name,font=f_display(72),fill=(23,23,23,round(255*opacity)))
            image.paste(layer,(0,0),layer)
    reveal=tween(frame,54,86); word=tween(frame,74,104); line=tween(frame,96,122)
    if reveal>.02:
        group_w=570; mx=960-group_w//2; mark(draw,mx,450,128,reveal)
        layer=Image.new('RGBA',image.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
        d.text((mx+166,420),'Galok',font=f_display(140),fill=(23,23,23,round(255*word)))
        tracked(d,(mx+166,568),'VIEW · FRAME · OBSERVE',f_meta(44),(158,42,43,round(255*word)),5)
        d.text((960,920),'A quiet field that grows itself.',font=f_italic(38),anchor='mm',fill=(119,115,107,round(255*line)))
        image.paste(layer,(0,0),layer)
    return image


def frame_at(frame: int) -> Image.Image:
    frame=max(0,min(FRAMES-1,frame))
    if frame<114: return brand_open(frame)
    if frame<264: return growth_first(frame-114)
    if frame<474: return word_relay(frame-264)
    if frame<642: return scan_frame(frame-474)
    if frame<810: return observe_scene(frame-642)
    if frame<978: return merge_scene(frame-810)
    final = outro(frame-978)
    if frame >= 1116:
        return Image.blend(final, brand_open(0), smooth((frame - 1116) / 23))
    return final


def render(output: Path):
    output.parent.mkdir(parents=True,exist_ok=True)
    command=['ffmpeg','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{WIDTH}x{HEIGHT}','-framerate',str(FPS),'-i','-','-an','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(output)]
    process=subprocess.Popen(command,stdin=subprocess.PIPE)
    assert process.stdin is not None
    for index in range(FRAMES):
        process.stdin.write(frame_at(index).tobytes())
        if index%150==0: print(f'rendered {index:04d}/{FRAMES}')
    process.stdin.close(); code=process.wait()
    if code: raise SystemExit(code)


def main():
    parser=argparse.ArgumentParser(); group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--render',type=Path); group.add_argument('--still',type=int)
    parser.add_argument('output',nargs='?',type=Path)
    args=parser.parse_args()
    if args.render: render(args.render)
    else:
        if args.output is None: parser.error('still output path is required')
        args.output.parent.mkdir(parents=True,exist_ok=True); frame_at(args.still).save(args.output)


if __name__=='__main__': main()
