import { Modal, Button } from "antd";
import { useState } from "react";

function Menu() {

    const { open, setOpen } = useState(false);
    return (
        <Modal
            title="菜单"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
        >
            <div>菜单</div>
            <Button onClick={() => setOpen(false)}>关闭</Button>
        </Modal>
    );
}

export default Menu;