
Script.include([
    "/~/system/libraries/utils.js",
    "/~/system/libraries/toolBars.js",
    "voxel-ground-utils.js"
]);

var smallPlotSize = 16;

var controlHeld = false;
var shiftHeld = false;

// var HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
// Script.include([
//     HIFI_PUBLIC_BUCKET + "scripts/libraries/toolBars.js",
//     HIFI_PUBLIC_BUCKET + "scripts/libraries/utils.js",
// ]);

var isActive = false;
var toolIconUrl = "http://headache.hungry.com/~seth/hifi/terrain/";
var toolHeight = 50;
var toolWidth = 50;

var addingVoxels = false;
var deletingVoxels = false;
var addingSpheres = false;
var deletingSpheres = false;

var offAlpha = 0.8;
var onAlpha = 1.0;
var editSphereRadius = 4;

function floorVector(v) {
    return {x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z)};
}

var toolBar = (function () {
    var that = {},
        toolBar,
        activeButton,
        addVoxelButton,
        // deleteVoxelButton,
        addSphereButton,
        // deleteSphereButton,
        addTerrainButton;

    function initialize() {
        toolBar = new ToolBar(0, 0, ToolBar.VERTICAL, "highfidelity.voxel.toolbar", function (windowDimensions, toolbar) {
            return {
                x: windowDimensions.x - 8*2 - toolbar.width * 2,
                y: (windowDimensions.y - toolbar.height) / 2
            };
        });

        activeButton = toolBar.addTool({
            imageURL: "http://s3.amazonaws.com/hifi-public/images/tools/polyvox.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: onAlpha,
            visible: true,
        }, false);

        addVoxelButton = toolBar.addTool({
            imageURL: toolIconUrl + "voxel-add.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: offAlpha,
            visible: false
        }, false);

        // deleteVoxelButton = toolBar.addTool({
        //     imageURL: toolIconUrl + "voxel-delete.svg",
        //     width: toolWidth,
        //     height: toolHeight,
        //     alpha: offAlpha,
        //     visible: false
        // }, false);

        addSphereButton = toolBar.addTool({
            imageURL: toolIconUrl + "sphere-add.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: offAlpha,
            visible: false
        }, false);

        // deleteSphereButton = toolBar.addTool({
        //     imageURL: toolIconUrl + "sphere-delete.svg",
        //     width: toolWidth,
        //     height: toolHeight,
        //     alpha: offAlpha,
        //     visible: false
        // }, false);

        addTerrainButton = toolBar.addTool({
            imageURL: toolIconUrl + "voxel-terrain.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: onAlpha,
            visible: false
        }, false);

        flattenButton = toolBar.addTool({
            imageURL: toolIconUrl + "flatten.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: onAlpha,
            visible: false
        }, false);

        smoothButton = toolBar.addTool({
            imageURL: toolIconUrl + "smooth.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: onAlpha,
            visible: false
        }, false);

        lockButton = toolBar.addTool({
            imageURL: toolIconUrl + "lock.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: onAlpha,
            visible: false
        }, false);

        unlockButton = toolBar.addTool({
            imageURL: toolIconUrl + "unlock.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: onAlpha,
            visible: false
        }, false);



        that.setActive(false);
    }

    function disableAllButtons() {
        addingVoxels = false;
        deletingVoxels = false;
        addingSpheres = false;
        deletingSpheres = false;

        toolBar.setAlpha(offAlpha, addVoxelButton);
        // toolBar.setAlpha(offAlpha, deleteVoxelButton);
        toolBar.setAlpha(offAlpha, addSphereButton);
        // toolBar.setAlpha(offAlpha, deleteSphereButton);

        toolBar.selectTool(addVoxelButton, false);
        // toolBar.selectTool(deleteVoxelButton, false);
        toolBar.selectTool(addSphereButton, false);
        // toolBar.selectTool(deleteSphereButton, false);
    }

    that.setActive = function(active) {
        if (active != isActive) {
            isActive = active;
            that.showTools(isActive);
        }
        toolBar.selectTool(activeButton, isActive);
    };

    // Sets visibility of tool buttons, excluding the power button
    that.showTools = function(doShow) {
        toolBar.showTool(addVoxelButton, doShow);
        // toolBar.showTool(deleteVoxelButton, doShow);
        toolBar.showTool(addSphereButton, doShow);
        // toolBar.showTool(deleteSphereButton, doShow);
        toolBar.showTool(addTerrainButton, doShow);
        toolBar.showTool(flattenButton, doShow);
        toolBar.showTool(smoothButton, doShow);
        toolBar.showTool(lockButton, doShow);
        toolBar.showTool(unlockButton, doShow);
    };

    that.mousePressEvent = function (event) {
        var clickedOverlay = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });

        if (activeButton === toolBar.clicked(clickedOverlay)) {
            that.setActive(!isActive);
            return true;
        }

        if (addVoxelButton === toolBar.clicked(clickedOverlay)) {
            var wasAddingVoxels = addingVoxels;
            disableAllButtons()
            if (!wasAddingVoxels) {
                addingVoxels = true;
                toolBar.setAlpha(onAlpha, addVoxelButton);
            }
            return true;
        }

        // if (deleteVoxelButton === toolBar.clicked(clickedOverlay)) {
        //     var wasDeletingVoxels = deletingVoxels;
        //     disableAllButtons()
        //     if (!wasDeletingVoxels) {
        //         deletingVoxels = true;
        //         toolBar.setAlpha(onAlpha, deleteVoxelButton);
        //     }
        //     return true;
        // }

        if (addSphereButton === toolBar.clicked(clickedOverlay)) {
            var wasAddingSpheres = addingSpheres
            disableAllButtons()
            if (!wasAddingSpheres) {
                addingSpheres = true;
                toolBar.setAlpha(onAlpha, addSphereButton);
            }
            return true;
        }

        // if (deleteSphereButton === toolBar.clicked(clickedOverlay)) {
        //     var wasDeletingSpheres = deletingSpheres;
        //     disableAllButtons()
        //     if (!wasDeletingSpheres) {
        //         deletingSpheres = true;
        //         toolBar.setAlpha(onAlpha, deleteSphereButton);
        //     }
        //     return true;
        // }

        if (addTerrainButton === toolBar.clicked(clickedOverlay)) {
            addTerrainBlock();
            return true;
        }

        if (flattenButton === toolBar.clicked(clickedOverlay)) {
            flattenArea();
            return true;
        }

        if (smoothButton === toolBar.clicked(clickedOverlay)) {
            smoothArea();
            return true;
        }

        if (lockButton === toolBar.clicked(clickedOverlay)) {
            lockTerrain();
            return true;
        }

        if (unlockButton === toolBar.clicked(clickedOverlay)) {
            unLockTerrain();
            return true;
        }

    }

    Window.domainChanged.connect(function() {
        that.setActive(false);
    });

    that.cleanup = function () {
        toolBar.cleanup();
    };


    initialize();
    return that;
}());



function getTerrainAlignedLocation(pos) {
    var posDiv16 = Vec3.multiply(pos, 1.0 / 16.0);
    var posDiv16Floored = floorVector(posDiv16);
    return Vec3.multiply(posDiv16Floored, 16.0);
}


function grabLowestJointY() {
    var jointNames = MyAvatar.getJointNames();
    var floorY = MyAvatar.position.y;
    for (var jointName in jointNames) {
        if (MyAvatar.getJointPosition(jointNames[jointName]).y < floorY) {
            floorY = MyAvatar.getJointPosition(jointNames[jointName]).y;
        }
    }
    return floorY;
}


function flattenArea() {
    var lowPoint = grabLowestJointY();
    var flattenDistance = 2.0;
    var sphereRadius = 1.0;

    var terrainIDs = [];
    var allIDs = Entities.findEntities(MyAvatar.position, 20);
    for (var i = 0; i < allIDs.length; i++) {
        var name = Entities.getEntityProperties(allIDs[i], ["name"]).name;
        if (name == "terrain") {
            terrainIDs.push(allIDs[i]);
        }
    }

    print("terrainIDs = " + terrainIDs);

    // for (var x = -flattenDistance; x < flattenDistance; x += 0.5) {
    //     for (var z = -flattenDistance; z < flattenDistance; z += 0.5) {
    //         var spot = {
    //             x: MyAvatar.position.x + x,
    //             y: lowPoint + sphereRadius,
    //             z: MyAvatar.position.z + z
    //         };
    //         for (var entityIndex in terrainIDs) {
    //             var terrainID = terrainIDs[entityIndex];
    //             Entities.setVoxelSphere(terrainID, spot, sphereRadius, 0);
    //         }
    //     }
    // }

    var lowSpot = {
        x: MyAvatar.position.x - flattenDistance,
        y: lowPoint,
        z: MyAvatar.position.z - flattenDistance
    };
    var highSpot = {
        x: MyAvatar.position.x + flattenDistance,
        y: lowPoint,
        z: MyAvatar.position.z + flattenDistance
    };
    for (var entityIndex in terrainIDs) {
        var terrainID = terrainIDs[entityIndex];
        // Entities.setVoxelSphere(terrainID, spot, sphereRadius, 0);
        var lowVoxelSpot = Entities.worldCoordsToVoxelCoords(terrainID, lowSpot);
        var highVoxelSpot = Entities.worldCoordsToVoxelCoords(terrainID, highSpot);
        var cuboidSize = {
            x: highVoxelSpot.x - lowVoxelSpot.x,
            y: 64,
            z: highVoxelSpot.z - lowVoxelSpot.z
        };

        print("low = " + vec3toStr(lowVoxelSpot));
        print("high = " + vec3toStr(highVoxelSpot));

        Entities.setVoxelsInCuboid(terrainID, lowVoxelSpot, cuboidSize, 0);
    }
}

function smoothArea() {
}

function addTerrainBlock() {
    var baseLocation = getTerrainAlignedLocation(Vec3.sum(MyAvatar.position, {x:8, y:8, z:8}));
    if (baseLocation.y > MyAvatar.position.y) {
        baseLocation.y -= 16;
    }

    var alreadyThere = lookupTerrainForLocation(baseLocation, 16);
    if (alreadyThere) {
        // there is already a terrain block under MyAvatar.
        // try in front of the avatar.
        facingPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(8.0, Quat.getFront(Camera.getOrientation())));
        facingPosition = Vec3.sum(facingPosition, {x:8, y:8, z:8});
        baseLocation = getTerrainAlignedLocation(facingPosition);
        alreadyThere = lookupTerrainForLocation(baseLocation, 16);
        if (alreadyThere) {
            return null;
        }
    }

    var polyVoxID = addTerrainBlockNearLocation(baseLocation);

    if (polyVoxID) {
        var AvatarPositionInVoxelCoords = Entities.worldCoordsToVoxelCoords(polyVoxID, MyAvatar.position);
        // TODO -- how to find the avatar's feet?
        var topY = Math.round(AvatarPositionInVoxelCoords.y) - 4;
        Entities.setVoxelsInCuboid(polyVoxID, {x:0, y:0, z:0}, {x:16, y:topY, z:16}, 255);
    }
}

function addTerrainBlockNearLocation(baseLocation) {
    var alreadyThere = lookupTerrainForLocation(baseLocation, 16);
    if (alreadyThere) {
        return null;
    }

    var polyVoxID = addTerrainAtPosition(baseLocation, smallPlotSize);

    //////////
    // stitch together the terrain with x/y/z NeighorID properties
    //////////

    // link neighbors to this plot
    imXNNeighborFor = lookupTerrainForLocation(Vec3.sum(baseLocation, {x:16, y:0, z:0}), 16);
    imYNNeighborFor = lookupTerrainForLocation(Vec3.sum(baseLocation, {x:0, y:16, z:0}), 16);
    imZNNeighborFor = lookupTerrainForLocation(Vec3.sum(baseLocation, {x:0, y:0, z:16}), 16);
    imXPNeighborFor = lookupTerrainForLocation(Vec3.sum(baseLocation, {x:-16, y:0, z:0}), 16);
    imYPNeighborFor = lookupTerrainForLocation(Vec3.sum(baseLocation, {x:0, y:-16, z:0}), 16);
    imZPNeighborFor = lookupTerrainForLocation(Vec3.sum(baseLocation, {x:0, y:0, z:-16}), 16);

    if (imXNNeighborFor) {
        Entities.editEntity(imXNNeighborFor, {locked: false});
        Entities.editEntity(imXNNeighborFor, {xNNeighborID: polyVoxID, locked: true});
    }
    if (imYNNeighborFor) {
        Entities.editEntity(imYNNeighborFor, {locked: false});
        Entities.editEntity(imYNNeighborFor, {yNNeighborID: polyVoxID, locked: true});
    }
    if (imZNNeighborFor) {
        Entities.editEntity(imZNNeighborFor, {locked: false});
        Entities.editEntity(imZNNeighborFor, {zNNeighborID: polyVoxID, locked: true});
    }
    if (imXPNeighborFor) {
        Entities.editEntity(imXPNeighborFor, {locked: false});
        Entities.editEntity(imXPNeighborFor, {xPNeighborID: polyVoxID, locked: true});
    }
    if (imYPNeighborFor) {
        Entities.editEntity(imYPNeighborFor, {locked: false});
        Entities.editEntity(imYPNeighborFor, {yPNeighborID: polyVoxID, locked: true});
    }
    if (imZPNeighborFor) {
        Entities.editEntity(imZPNeighborFor, {locked: false});
        Entities.editEntity(imZPNeighborFor, {zPNeighborID: polyVoxID, locked: true});
    }

    // link this plot to its neighbors
    Entities.editEntity(polyVoxID, {
        xNNeighborID: imXPNeighborFor,
        yNNeighborID: imYPNeighborFor,
        zNNeighborID: imZPNeighborFor,
        xPNeighborID: imXNNeighborFor,
        yPNeighborID: imYNNeighborFor,
        zPNeighborID: imZNNeighborFor
    });

    return polyVoxID;
}


function attemptVoxelChangeForEntity(entityID, pickRayDir, intersectionLocation) {

    var properties = Entities.getEntityProperties(entityID);
    if (properties.type != "PolyVox") {
        return false;
    }

    if (addingVoxels == false && deletingVoxels == false && addingSpheres == false && deletingSpheres == false) {
        return false;
    }

    var voxelOrigin = Entities.worldCoordsToVoxelCoords(entityID, Vec3.subtract(intersectionLocation, pickRayDir));
    var voxelPosition = Entities.worldCoordsToVoxelCoords(entityID, intersectionLocation);
    var pickRayDirInVoxelSpace = Vec3.subtract(voxelPosition, voxelOrigin);
    pickRayDirInVoxelSpace = Vec3.normalize(pickRayDirInVoxelSpace);

    var doAdd = addingVoxels;
    var doDelete = deletingVoxels;
    var doAddSphere = addingSpheres;
    var doDeleteSphere = deletingSpheres;

    if (controlHeld) {
        if (doAdd) {
            doAdd = false;
            doDelete = true;
        } else if (doDelete) {
            doDelete = false;
            doAdd = true;
        } else if (doAddSphere) {
            doAddSphere = false;
            doDeleteSphere = true;
        } else if (doDeleteSphere) {
            doDeleteSphere = false;
            doAddSphere = true;
        }
    }

    if (doDelete) {
        var toErasePosition = Vec3.sum(voxelPosition, Vec3.multiply(pickRayDirInVoxelSpace, 0.1));
        return Entities.setVoxel(entityID, floorVector(toErasePosition), 0);
    }
    if (doAdd) {
        var toDrawPosition = Vec3.subtract(voxelPosition, Vec3.multiply(pickRayDirInVoxelSpace, 0.1));
        return Entities.setVoxel(entityID, floorVector(toDrawPosition), 255);
    }
    if (doDeleteSphere) {
        var toErasePosition = intersectionLocation;
        return Entities.setVoxelSphere(entityID, floorVector(toErasePosition), editSphereRadius, 0);
    }
    if (doAddSphere) {
        var toDrawPosition = intersectionLocation;
        return Entities.setVoxelSphere(entityID, floorVector(toDrawPosition), editSphereRadius, 255);
    }
}


function attemptVoxelChange(pickRayDir, intersection) {

    var ids;

    ids = Entities.findEntities(intersection.intersection, editSphereRadius + 1.0);
    if (ids.indexOf(intersection.entityID) < 0) {
        ids.push(intersection.entityID);
    }

    var success = false;
    for (var i = 0; i < ids.length; i++) {
        var entityID = ids[i];
        success |= attemptVoxelChangeForEntity(entityID, pickRayDir, intersection.intersection)
    }
    return success;
}


function mousePressEvent(event) {
    if (!event.isLeftButton) {
        return;
    }

    if (toolBar.mousePressEvent(event)) {
        return;
    }

    var pickRay = Camera.computePickRay(event.x, event.y);
    var intersection = Entities.findRayIntersection(pickRay, true); // accurate picking

    if (intersection.intersects) {
        if (attemptVoxelChange(pickRay.direction, intersection)) {
            return;
        }
    }

    // if the PolyVox entity is empty, we can't pick against its "on" voxels.  try picking against its
    // bounding box, instead.
    intersection = Entities.findRayIntersection(pickRay, false); // bounding box picking
    if (intersection.intersects) {
        attemptVoxelChange(pickRay.direction, intersection);
    }
}


function keyPressEvent(event) {
    if (event.text == "CONTROL") {
        controlHeld = true;
    }
    if (event.text == "SHIFT") {
        shiftHeld = true;
    }
}


function keyReleaseEvent(event) {
    if (event.text == "CONTROL") {
        controlHeld = false;
    }
    if (event.text == "SHIFT") {
        shiftHeld = false;
    }
}


function cleanup() {
    toolBar.cleanup();
}


Controller.mousePressEvent.connect(mousePressEvent);
Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);
Script.scriptEnding.connect(cleanup);
