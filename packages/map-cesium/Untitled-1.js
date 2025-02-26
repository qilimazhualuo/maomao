// Use clipping planes to selectively hide parts of the globe surface.
const viewer = new Cesium.Viewer("cesiumContainer", {
    skyAtmosphere: false,
    shouldAnimate: true,
    terrain: Cesium.Terrain.fromWorldTerrain(),
    scene3DOnly: true,
});
const globe = viewer.scene.globe;

const exampleTypes = ["Cesium Man", "St. Helens", "Grand Canyon Isolated"];
const viewModel = {
    exampleTypes: exampleTypes,
    currentExampleType: exampleTypes[0],
    clippingPlanesEnabled: true,
    edgeStylingEnabled: true,
};
const toolbar = document.getElementById("toolbar");
Cesium.knockout.track(viewModel);
Cesium.knockout.applyBindings(viewModel, toolbar);

// For tracking state when switching exampleTypes
let clippingPlanesEnabled = true;
let edgeStylingEnabled = true;

let tileset;

loadCesiumMan();

function reset() {
    viewer.entities.removeAll();
    viewer.scene.primitives.remove(tileset);
}

function loadCesiumMan() {
    const position = Cesium.Cartesian3.fromRadians(
        -2.0862979473351286,
        0.6586620013036164,
        1400.0,
    );

    const entity = viewer.entities.add({
        position: position,
        box: {
            dimensions: new Cesium.Cartesian3(1400.0, 1400.0, 2800.0),
            material: Cesium.Color.WHITE.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.WHITE,
        },
    });

    viewer.entities.add({
        position: position,
        model: {
            uri: "../SampleData/models/CesiumMan/Cesium_Man.glb",
            minimumPixelSize: 128,
            maximumScale: 800,
        },
    });

    globe.depthTestAgainstTerrain = true;
    globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
        modelMatrix: entity.computeModelMatrix(Cesium.JulianDate.now()),
        planes: [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), -700.0),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), -700.0),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), -700.0),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), -700.0),
        ],
        edgeWidth: edgeStylingEnabled ? 1.0 : 0.0,
        edgeColor: Cesium.Color.WHITE,
        enabled: clippingPlanesEnabled,
    });
    globe.backFaceCulling = true;
    globe.showSkirts = true;

    viewer.trackedEntity = entity;
}

function loadGrandCanyon() {
    // Pick a position at the Grand Canyon
    const position = Cesium.Cartographic.toCartesian(
        new Cesium.Cartographic.fromDegrees(-114.2665534, 36.0939345, 100),
    );
    const distance = 3000.0;
    const boundingSphere = new Cesium.BoundingSphere(position, distance);

    globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
        planes: [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), distance),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), distance),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), distance),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), distance),
        ],
        unionClippingRegions: true,
        edgeWidth: edgeStylingEnabled ? 1.0 : 0.0,
        edgeColor: Cesium.Color.WHITE,
        enabled: clippingPlanesEnabled,
    });
    globe.backFaceCulling = false;
    globe.showSkirts = false;

    viewer.camera.viewBoundingSphere(
        boundingSphere,
        new Cesium.HeadingPitchRange(0.5, -0.5, boundingSphere.radius * 5.0),
    );
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}
