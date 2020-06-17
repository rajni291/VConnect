import Activities from "../../activities/components/Activities"
import { IonPage, IonHeader, IonToolbar, IonContent, IonIcon, useIonViewWillEnter, IonFooter } from "@ionic/react";
import React, { useState } from "react";
import './Home.css'
import { arrowRedoCircleOutline, home } from "ionicons/icons";
import Clubs from "../../clubs/components/Clubs";
import Fun from "../../fun/components/Fun";
import '@ionic/react/css/flex-utils.css';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;
const Home: React.FC = () => {

    let [menu, setmenu] = useState("");
    let profile = localStorage.getItem("user");
    const homeTile = [
        {
            id: 'activity',
            name: 'Activities'

        },
        {
            id: 'clubs',
            name: 'Clubs'

        },
        {
            id: 'fun',
            name: 'Fun'
        }
    ];


    useIonViewWillEnter(() => {
        setmenu("home");
        console.log('ionViewWillEnter event fired');
    });
    document.addEventListener('ionBackButton', (ev: any) => {
        ev.detail.register(10, () => {
            if (menu !== 'home') {
                setmenu('home');
            } else {
                App.exitApp()
            }
        });

    });

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="header">
                    <div className="header-title">V Connect</div>
                </IonToolbar>
            </IonHeader>
            <IonContent class="background" slot="fixed">
                <div className="home-page">
                    <div className={menu === "home" ? "show-home" : "hide-home"}>
                        <div className="name"> Hey {profile}</div>
                        <div className="detail"> Now you can collaborate with your friends</div>
                        <div className="menu">
                            {homeTile.map((tile: any) => (
                                <div className="tile-container" key={tile.id} onClick={() => setmenu(tile.id)}>
                                    <div className="home-tile">
                                        {tile.name}
                                        <span className="arrow-icon">
                                            <IonIcon size="large" slot="end" icon={arrowRedoCircleOutline} mode="ios" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(() => {
                        if (menu === 'activity') {
                            return <Activities profile={profile}></Activities>
                        }
                        else if (menu === 'clubs') {
                            return <Clubs profile={profile}></Clubs>
                        }
                        else if (menu === 'fun') {
                            return <Fun profile={profile}></Fun>
                        }
                    })()}
                </div>
            </IonContent>
            <IonFooter >
                <div className="home-footer" onClick={() => setmenu("home")}>
                    <IonIcon className="home-icon" mode="ios" src={home}></IonIcon>
                </div>
            </IonFooter>
        </IonPage>
    );
};
export default Home;