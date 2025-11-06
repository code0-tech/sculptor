import React from "react";
import Link from "next/link";

const Modal: React.FC = (props) => {

    return <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
    }}>
        Test
        <Link href={"/"}>Close Modal</Link>
    </div>

}

export default Modal