
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

import init, * as CursedWASM from '../../cursed-egui';

const CursedNavBar = () => {


    return (<Navbar className="bp5-dark">
        <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Cursed Web Demo</Navbar.Heading>
            <Navbar.Divider />
            <Button className="bp5-minimal" icon="timeline-line-chart" text="Generate: Sin Wave" onClick={CursedWASM.cursed_sin} />
            <Button className="bp5-minimal" icon="random" text="Generate: Random Points" onClick={CursedWASM.cursed_random_data} />
            <Button className="bp5-minimal" icon="th-list" text="Generate: Example CSV" onClick={CursedWASM.cursed_load_csv} />

        </Navbar.Group>
    </Navbar>
    )
}
export default CursedNavBar;