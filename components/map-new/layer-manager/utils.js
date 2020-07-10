import { lngLatToWorld, worldToLngLat } from 'viewport-mercator-project';

const CIRCLE_TO_SPIRAL_SWITCHOVER = 15;

const CIRCLE_OPTIONS = {
  distanceBetweenPoints: 50
};

const SPIRAL_OPTIONS = {
  rotationsModifier: 1500, // Higher modifier = closer spiral lines
  distanceBetweenPoints: 32, // Distance between points in spiral
  radiusModifier: 40000, // Spiral radius
  lengthModifier: 1000 // Spiral length modifier
};

export function generateEquidistantPointsInCircle({
  totalPoints = 1,
  options = CIRCLE_OPTIONS
}) {
  const points = [];
  const theta = (Math.PI * 2) / totalPoints;
  let angle = theta;
  for (let i = 0; i < totalPoints; i++) {
    angle = theta * i;
    points.push({
      x: options.distanceBetweenPoints * Math.cos(angle),
      y: options.distanceBetweenPoints * Math.sin(angle)
    });
  }
  return points;
}

export function generateEquidistantPointsInSpiral({
  totalPoints = 10,
  options = SPIRAL_OPTIONS
}) {
  const points = [];
  // Higher modifier = closer spiral lines
  const rotations = totalPoints * options.rotationsModifier;
  const distanceBetweenPoints = options.distanceBetweenPoints;
  const radius = totalPoints * options.radiusModifier;
  // Value of theta corresponding to end of last coil
  const thetaMax = rotations * 2 * Math.PI;
  // How far to step away from center for each side.
  const awayStep = radius / thetaMax;

  for (
    let theta = distanceBetweenPoints / awayStep;
    points.length <= totalPoints + options.lengthModifier;

  ) {
    points.push({
      x: Math.cos(theta) * (awayStep * theta),
      y: Math.sin(theta) * (awayStep * theta)
    });
    theta += distanceBetweenPoints / (awayStep * theta);
  }
  return points.slice(0, totalPoints);
}

function generateLeavesCoordinates({ nbOfLeaves }) {
  let points;
  // Position cluster's leaves in circle if below threshold, spiral otherwise
  if (nbOfLeaves < CIRCLE_TO_SPIRAL_SWITCHOVER) {
    points = generateEquidistantPointsInCircle({
      totalPoints: nbOfLeaves
    });
  } else {
    points = generateEquidistantPointsInSpiral({
      totalPoints: nbOfLeaves
    });
  }
  return points;
}

export function spiderifyCluster({ coordinates = [], features = [], zoom = 4 }) {
  if (!features.length) return {};

  const spiderlegsCollection = [];
  const spiderLeavesCollection = [];

  const leavesCoordinates = generateLeavesCoordinates({
    nbOfLeaves: features.length
  });


  const clusterXY = lngLatToWorld(coordinates, 1);

  // Generate spiderlegs and leaves coordinates
  features.forEach((element, index) => {
    const { properties } = element;

    const spiderLeafLatLng = worldToLngLat([
      clusterXY[0] + (leavesCoordinates[index].x / (2 ** zoom)),
      clusterXY[1] + (leavesCoordinates[index].y / (2 ** zoom))
    ], 1);

    spiderLeavesCollection.push({
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: [spiderLeafLatLng[0], spiderLeafLatLng[1]]
      }
    });

    spiderlegsCollection.push({
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates: [
          coordinates,
          [spiderLeafLatLng[0], spiderLeafLatLng[1]]
        ]
      }
    });
  });

  // Draw spiderlegs and leaves coordinates
  return {
    legs: {
      type: 'FeatureCollection',
      features: spiderlegsCollection
    },
    leaves: {
      type: 'FeatureCollection',
      features: spiderLeavesCollection
    }
  };
}
