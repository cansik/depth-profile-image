# Depth Profile Image Viewer
An example on how to use depth images to create a profile team page.

### Extract Depth Image
After creating a protrait photo with the iPhone True-Depth camera, extract the matt and depth frame from the image with the following commands:

```bash
exiftool -b -MPImage3 img.jpeg > matt.jpg
exiftool -b -MPImage2 img.jpeg > depth.jpg
```
