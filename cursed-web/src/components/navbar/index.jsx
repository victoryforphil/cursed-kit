
import {
    Alignment,
    Button,
    Classes,
    H5,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
    Switch,
} from "@blueprintjs/core";

import init, * as CursedWASM from '../../wasm/cursed-egui';
import {CSVServiceClient} from "cursed-grpc-gen/CursedServiceClientPb"
import * as CursedPB from "cursed-grpc-gen/cursed_pb"
const CursedNavBar = () => {


        const openCSV = async () => {
            const url = "http://localhost:5050";
            const client = new CSVServiceClient(url, null, null);
            console.log("Requesting topic list")
            const request = new CursedPB.CSVRequest("");
            client.requestCSV(request).then((response) => {
                console.log("Received topic list")
                console.log(response)
                CursedWASM.cursed_load_csv(response.getCsvContents())
            }).catch((error) => {
                console.log("Error requesting topic list")
                console.log(error)
            })
        }

    return (<Navbar className="bp5-dark">
        <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Cursed Web Demo</Navbar.Heading>
            <Navbar.Divider />

            <Button className="bp5-minimal" icon="th-list" text="Load: CSV" onClick={openCSV} />
        </Navbar.Group>
    </Navbar>
    )
}
export default CursedNavBar;