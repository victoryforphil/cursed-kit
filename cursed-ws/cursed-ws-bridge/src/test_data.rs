

#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct TestVec3{
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl TestVec3{
    pub fn new(x: f64, y: f64, z: f64) -> Self{
        Self{x, y, z}
    }

    pub fn new_sin(t: f64) -> Self{
        Self{x: t.sin(), y: t.cos(), z: t.tan()}
    }
}

#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct TestPose{
    pub position: TestVec3,
    pub rotation: TestVec3,
}

impl TestPose{
    pub fn new(position: TestVec3, rotation: TestVec3) -> Self{
        Self{position, rotation}
    }

    pub fn new_sin(t: f64) -> Self{
        Self{position: TestVec3::new_sin(t), rotation: TestVec3::new_sin(t)}
    }
}
#[derive(Debug, Clone, PartialEq, PartialOrd, serde::Deserialize, serde::Serialize)]
pub struct TestData{
    pub pose: TestPose,
    pub velocity: TestVec3,
    pub acceleration: TestVec3,
}   

impl TestData{
    pub fn new(pose: TestPose, velocity: TestVec3, acceleration: TestVec3) -> Self{
        Self{pose, velocity, acceleration}
    }

    pub fn new_sin(t: f64) -> Self{
        Self{pose: TestPose::new_sin(t), velocity: TestVec3::new_sin(t), acceleration: TestVec3::new_sin(t)}
    }
}