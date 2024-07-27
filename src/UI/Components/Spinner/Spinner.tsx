import {useEffect} from "react";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import './Spinner.scss';
import divider from "../Divider/Divider";

const Spinner = ({
     type,
     center = false,
     style
}: {
    type: SpinnerType,
    center?: boolean,
    style?: React.CSSProperties
}) => {
    function getSpinnerByType() {
        switch (type) {
            case SpinnerType.CYCLE:
                return <div style={{
                    ...style,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <div className="cycle-spinner"></div>
                </div>
            case SpinnerType.DOTS:
                return (
                    <div className="dot-spinner" style={style}>
                        <div className="dot-bounce-1"></div>
                        <div className="dot-bounce-2"></div>
                        <div className="dot-bounce-3"></div>
                    </div>
                )
        }
    }

    return <div style={center ? {display:"flex", justifyContent:"center", alignItems:"center", width:"100%"} : {margin:5}}>
        {getSpinnerByType()}
    </div>
};

export default Spinner;