fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("../cursed-proto/cursed.proto")?;
    Ok(())
}