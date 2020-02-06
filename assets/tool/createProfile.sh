#!/bin/bash

IMAGE_FORMAT="jpeg"

if [ $# -eq 0 ]
  then
    echo "createProfile.sh prortrait.$IMAGE_FORMAT"
    exit 0
fi

INPUT_FILE=$1

NAME=$(echo "$1" | cut -f 1 -d '.')

COLOR_FILE="$NAME-color.$IMAGE_FORMAT"
MATT_FILE="$NAME-matt.$IMAGE_FORMAT"
DEPTH_FILE="$NAME-depth.$IMAGE_FORMAT"

echo "extracting meta images..."
exiftool -b -MPImage2 $INPUT_FILE > $MATT_FILE
exiftool -b -MPImage3 $INPUT_FILE > $DEPTH_FILE

echo "resize color and matt image..."
magick $DEPTH_FILE $INPUT_FILE -resize %[fx:u.w]x%[fx:u.h] -gravity center $COLOR_FILE
#magick $DEPTH_FILE $MATT_FILE -resize %[fx:u.w]x%[fx:u.h] -gravity center $MATT_FILE

echo "mask out color and depth image..."


echo "extraction done"