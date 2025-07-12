import React, {PropsWithChildren, useEffect} from 'react';
import {useNavigate} from "react-router-dom";

const Redirect = ({
    redirectIf,
    redirectTo,
    children
}: PropsWithChildren<{
    redirectIf: boolean,
    redirectTo: string
}>) => {
    const navigate = useNavigate()

    useEffect(() => {
        if (redirectIf) {
            navigate(redirectTo)
        }
    }, [redirectIf]);

    return (<div>
        {children}
    </div>)
};

export default Redirect;