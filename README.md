# Cocos Dashboard 2.1.2
# Cocos Project version 3.6.3 & 3.8.3

# Update version
- Support are limit on every version, so update Cocos Creator or Project Editor with caution.

# Tool build:
- Super-html package in version 3.8.3 need Node.js package install to use.

# Build
- Ironsource: <= 5MB - Use build Unity with version 3.6.3
- Mintegral: <= 2.5MB - Should use version 3.8.3 to minimize build size
- Unity: <= 5MB - Use build version 3.6.3 (Updated: Now can export >= 5MB)
- Amazon: Use build Mintegral with version 3.8.3

# Build Compress
- Spine: Don't export skin, animation & images attach to slot (check in *.png with *.json file after export) that not used in scene.

# Change link store
- Can change link store of HTML file build without re-build in project by search text "https://play.google.com/".

# Spine
- Export spine *.json version 3.8.3 for both cocos version 3.6.3 & 3.8.3.
- If want to change name file(s) of spine:
    + Do it inside folder explorer instead of cocos editor (and don't focus on cocos editor while doing this).
    + Then change name of image path in file *.atlas.txt (like "char.png" at the first line).

# Tilemap
- To open and edit Tile file in Cocos, use Tiled tool.
- Website: https://www.mapeditor.org/
- Itch.io: https://thorbjorn.itch.io/tiled