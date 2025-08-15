# Cocos Dashboard 2.1.2
# Cocos Project version 3.6.3 & 3.8.3 - 3.8.6

# Update version
- Support are limit on every version, so update Cocos Creator or Project Editor with caution.

# Update version 3.8.6
- From version 3.8.6, spine can used version 4.2, which can be switch in Project Settings/Feature Cropping/Spine Animation.
- Need close and start editor again to completed change.
- NOTICE: All spine with version 3.8 will can't be used anymore.

# Tool build
- Playable-build-tool package in version 3.6.3 can use performance.
- Super-html package in version 3.8.3 - 3.8.6 need Node.js package installed to use.

# Build
- Use version 3.8.6 playable for build playable all ads networks.
- Ironsource: <= 5MB
- Mintegral: <= 2.5MB
- Unity: <= 5MB
    + Unity playable's website checked upload file base on link game store, because used Super-html for build so it encoded and made failed to upload.
    + SOLUTION: Open playable game file *.html and add <b>comment</b> of link store game at the end.
- Amazon: Use build Mintegral
- Google: Use build Mintegral

# Build Compress
- Not choice all scene to build, it will increase size build.
- For some reason, cocos build will pack all assets in project, even not used in scene build, so check out spine, image and script for remove them if not necessary.
- Image (include image of spine): With size >=150KB can be called heavyly and should compress.
- Spine: Don't export skin, animation & images attach to slot (check in *.png with *.json file after export) that not used in scene, and not export as binary.
- Tile: Any tile sprite import into tile file *.tmx will make it heavier, remove any tile assets that don't used in scene.

# Spine
- Export file(s) spine *.json version 3.8.3 for both cocos version 3.6.3 & 3.8.3.
- If want to change name file(s) of spine:
    + Do it inside folder explorer instead of cocos editor (and don't focus on cocos editor while doing this).
    + Then change name of image path in file *.atlas.txt (like "char.png" at the first line).

# Tilemap
- To open and edit Tile file in Cocos, use Tiled tool.
- Website: https://www.mapeditor.org/
- Itch.io: https://thorbjorn.itch.io/tiled