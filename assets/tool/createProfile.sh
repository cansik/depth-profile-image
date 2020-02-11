#!/bin/bash

IMAGE_FORMAT="jpg"

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
exiftool -b -MPImage3 $INPUT_FILE > $MATT_FILE
exiftool -b -MPImage2 $INPUT_FILE > $DEPTH_FILE

# extract size of depth
DEPTH_SIZE=`identify -format '%wx%h' $DEPTH_FILE`
echo "depth size: $DEPTH_SIZE"

echo "resize color and matt image..."
magick $INPUT_FILE -resize $DEPTH_SIZE -gravity center $COLOR_FILE
magick $MATT_FILE -resize $DEPTH_SIZE -gravity center $MATT_FILE

echo "mask out color and depth image..."
convert $COLOR_FILE -negate $MATT_FILE $MATT_FILE -negate -compose DstOut -composite $COLOR_FILE
convert $DEPTH_FILE -negate $MATT_FILE $MATT_FILE -negate -compose DstOut -composite $DEPTH_FILE

# cleanup
rm $MATT_FILE
echo "extraction done"