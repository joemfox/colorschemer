import math
import random
import twitter
import cairocffi as cairo
from PIL import Image
import struct
from auth import *

api = twitter.Api(consumer_key=Akey,consumer_secret=Askey,access_token_key = Atoken,access_token_secret = Astoken)

adjective = open("adjectives.txt","r")
color = open("rgb.txt","r")
adjectives = adjective.read().splitlines()
colors = color.read().splitlines()
adjective1 = adjectives[random.randint(0,len(adjectives)-1)]
adjective2 = adjectives[random.randint(0,len(adjectives)-1)]
adjective3 = adjectives[random.randint(0,len(adjectives)-1)]
color1 = colors[random.randint(0,len(colors)-1)].split(",")
color2 = colors[random.randint(0,len(colors)-1)].split(",")
color3 = colors[random.randint(0,len(colors)-1)].split(",")
tweet = adjective1 + " " + color1[0] + "\n" + adjective2 + " " + color2[0] + "\n" + adjective3 + " " + color3[0]
tweet.replace("\n","")
print tweet

rgbstr1 = struct.unpack("BBB",color1[1][1:].decode("hex")) + (1,)
rgbstr2 = struct.unpack("BBB",color2[1][1:].decode("hex")) + (1,)
rgbstr3 = struct.unpack("BBB",color3[1][1:].decode("hex")) + (1,)

WIDTH,HEIGHT = 512,512

schemepng = cairo.ImageSurface(cairo.FORMAT_ARGB32,WIDTH,HEIGHT)
ctx = cairo.Context(schemepng)


portion = random.randint(3,6)
rotate = random.randint(0,3)

ctx.rectangle(0,0,WIDTH/portion,HEIGHT)
ctx.set_source_rgba(rgbstr1[0]/255.0,rgbstr1[1]/255.0,rgbstr1[2]/255.0,rgbstr1[3])
ctx.fill()

ctx.rectangle(WIDTH/portion,0,WIDTH,HEIGHT)
ctx.set_source_rgba(rgbstr2[0]/255.0,rgbstr2[1]/255.0,rgbstr2[2]/255.0,rgbstr2[3])
ctx.fill()

ctx.rectangle(WIDTH/(portion-1),0,WIDTH,HEIGHT)
ctx.set_source_rgba(rgbstr3[0]/255.0,rgbstr3[1]/255.0,rgbstr3[2]/255.0,rgbstr3[3])
ctx.fill()





schemepng.write_to_png("test.png")

rotated = Image.open("test.png").rotate(rotate*90)
rotated.save("test.png")

finalimage = open("test.png","r")

api.PostMedia(tweet,finalimage)
