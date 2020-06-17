
import { IonModal, IonInput, IonItem, IonLabel, IonButton, IonContent, IonPage, IonHeader, IonToolbar, } from "@ionic/react";
import React, { useState } from "react";
import '../../home/components/Home.css'
import { Redirect } from "react-router-dom";



const Profile: React.FC = () => {
    const [showModal, setshowModal] = useState(true);
    const [profile, setprofile] = useState<string>();

    const createProfile = () => {
        if (profile)
            localStorage.setItem("user", profile)
        setshowModal(false);
    }


    if (localStorage.getItem("user")) {
        return (
            <Redirect to={{
                pathname: '/home',
            }}
            />
        );
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="header">
                    <div className="header-title">V Connect</div>
                </IonToolbar>
            </IonHeader>
            <IonContent class="background">
                <IonModal backdropDismiss={false} cssClass="my-custom-modal-css" isOpen={showModal}>
                    <div className="container-color">
                        <div className="submit-popup-body">
                            <IonItem>
                                <IonLabel position="floating">Enter Name</IonLabel>
                                <IonInput value={profile} onIonChange={e => setprofile(e.detail.value!)} clearInput autofocus></IonInput>
                            </IonItem>
                        </div>
                        <div className="dialogs-elements-footer">
                            <IonButton className="dialog-submit-button" onClick={() => createProfile()}>
                                Ok</IonButton>
                        </div>
                    </div>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};
export default Profile;