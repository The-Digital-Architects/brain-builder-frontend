import React from "react";
import {useParams, Navigate} from 'react-router-dom';
import Header from "./common/header";
import underConstructionImage from "./images/under_construction_by_freepik.jpg";

function ConstructionView() {
    let { ex } = useParams();

    if (!ex.startsWith("exercise")) {  // if the URL does not start with "exercise", redirect to the not found page
        return <Navigate to="/notfound" replace />;
    } else {
        return (
            <div>
                <Header showHomeButton={true} />

                <img style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "auto",  // TODO tune this
                    height: "calc(100vh - 50px)",
                    margin: "auto"
                }} src={underConstructionImage} alt="Under construction" />

                <p style={{ textAlign: "center" }}>
                    Image by{" "}
                    <a href="https://www.freepik.com/free-vector/flat-construction-template_1584487.htm#query=under%20construction&position=7&from_view=keyword&track=ais_hybrid&uuid=29acba93-07b5-4497-9035-a974460776df">
                        Freepik
                    </a>
                </p>
            </div>
        );
    }
}

export default ConstructionView;