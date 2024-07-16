import React from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import './InfoDialog.scss';

const InfoDialog = ({
    infos
}: {
    infos: string[]
}) => {
    return (
        <DialogOverlay actions={[]}>
            <div className="info-dialog">
                {infos.map((info, index) => (
                    <div key={index}>{info}</div>
                ))}
            </div>
        </DialogOverlay>
    );
};

export default InfoDialog;