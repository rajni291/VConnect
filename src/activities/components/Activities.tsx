import React, { useEffect, useState } from 'react'
import './Activities.css';
import { IonButton, IonImg, IonIcon, IonLoading } from '@ionic/react';
import firebase from '../../core/firebase/Firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { handLeft, toggle } from 'ionicons/icons';
import moment from 'moment';


type Props = {
    profile: any;
}

const Activities: React.FC<Props> = ({ profile }) => {

    const url = '/assets/';

    let userActivity: any[] = [];
    let allActivity: any[] = [];
    let data: any[] = [];
    const [userAndAcitiyList, setuserAndAcitiyList] = useState(data);
    const [showLoading, setShowLoading] = useState(true);

    var todayDate = moment().format("DD/MM/YYYY");

    // const [value, error] = useCollection(
    //     firebase.firestore().collection("activities"));

    const fetchData = async () => {
        try {
            const today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setMilliseconds(0);
            today.setSeconds(0);
            let userActivityRef = firebase.firestore().collection('userActivity');
            let activityRef = firebase.firestore().collection('activities');
            userActivityRef.where('createdDate', '>=', today).get()
                .then(snapshot => {
                    snapshot.forEach(user => {
                        let t1 = user.data();
                        let userPresent = t1.Activity.filter((x: any) => x.user === profile);
                        if (userPresent.length > 0)
                            userPresent.forEach((activity: any) => {
                                userActivity.push(activity)
                            });
                    })
                });
            let count = 0;
            activityRef.get()
                .then(snapshot => {
                    snapshot.forEach(activity => {
                        count++
                        let t1 = activity.data();
                        t1.id = activity.id;
                        allActivity.push(t1);
                    })
                    if (allActivity.length === count)
                        getSomeMoredata();
                });
        } catch (err) {
            console.error(err);
        }

    };

    const getSomeMoredata = () => {
        let dataToMap: any[] = [];
        allActivity.forEach(a => {
            let userData = userActivity.find(x => x.key === a.key);
            let t1;
            if (userData) {
                t1 = {
                    id: a.id,
                    name: a.name,
                    key: userData.key,
                    count: a.count,
                    toggle: userData.toggle,
                    user: userData.user
                }
            }
            else {
                t1 = {
                    id: a.id,
                    name: a.name,
                    key: a.key,
                    count: a.count,
                    toggle: false,
                    user: profile
                }
            }
            dataToMap.push(t1);
        });
        setuserAndAcitiyList(dataToMap);
        setShowLoading(false);

    }

    useEffect(() => {
        if (userAndAcitiyList.length === 0)
            fetchData();
    });

    const getImageSrc = (key: string) => {

        switch (key.toLowerCase()) {
            case 'book':
                return url + 'book.png';
            case 'exercise':
                return url + 'exercise.png';
            case 'appreciate':
                return url + 'appreciate.png';
            case 'cook':
                return url + 'cook.png';
            case 'meditate':
                return url + 'meditate.png';
            case 'game':
                return url + 'game.png';
            case 'zumba':
                return url + 'zumba.png';
            case 'talkfriends':
                return url + 'talkedfriends.png';
            case 'homework':
                return url + 'homeworkDone.png';
            case 'helpingmother':
                return url + 'Helpingmother.jpg';
            case 'helpingneedy':
                return url + 'HelpedNeedy.jpg';
            case 'gardening':
                return url + 'Gardening.jpg';
            case 'yoga':
                return url + 'Yoga.png';






            default:
                return url + 'notFound.png';
        }
    }

    const increaseCounter = (doc: any, toggleValue: boolean) => {
        let userActivityRef = firebase.firestore().collection('activities');
        userActivityRef.doc(doc.id).get()
            .then(snapshot => {
                let userData = snapshot.data();
                if (userData) {
                    if (toggleValue === true) {
                        userData.count += 1;
                        doc.count += 1;
                    }
                    else {
                        if (userData.count > 0) {
                            userData.count -= 1;
                            doc.count -= 1;
                        }
                    }
                    firebase.firestore().collection("activities").doc(doc.id).update(userData).then(() =>{
                        let temp: any[] = [];
                        userAndAcitiyList.forEach(element => {
                            if (element.id === doc.id) {
                                element.toggle = toggleValue;
                                element.count = doc.count;
                                element.blur = false;
                            }
                            temp.push(element);
                        });
                        setuserAndAcitiyList(temp);
                    }
                    );
                }
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    const setUserActivity = (doc: any) => {
        doc.blur = true;    
        const today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setMilliseconds(0);
        today.setSeconds(0);
        let temp: any[] = [];
        userAndAcitiyList.forEach(element => {
            if (element.id === doc.id) {
                element.blur = true;
            }
            temp.push(element);
        });
        setuserAndAcitiyList(temp);

        // doc.toggle = !doc.toggle;
        let userActivityRef = firebase.firestore().collection('userActivity');
        userActivityRef.where('createdDate', '>=', today).get()
            .then(snapshot => {
                if (snapshot.empty) {
                    doc.toggle = true;
                    userActivityRef.doc().set({
                        Activity: [{
                            key: doc.key,
                            user: profile,
                            toggle: true
                        }],
                        createdDate: today
                    }).then(() =>{
                        increaseCounter(doc, true);
                    });
                }

                snapshot.forEach(userDoc => {
                    let updatedData = userDoc.data();
                    let userPresent = updatedData.Activity.filter((x: any) => x.user === profile && x.key === doc.key);
                    if (userPresent.length > 0) {
                        userPresent[0].toggle = !doc.toggle;
                        userActivityRef.doc(userDoc.id).update(updatedData).then(() =>{
                            increaseCounter(doc, userPresent[0].toggle)
                        });
                    } else {
                        let activity = {
                            key: doc.key,
                            user: profile,
                            toggle: !doc.toggle
                        }
                        updatedData.Activity.push(activity);
                        userActivityRef.doc(userDoc.id).update(updatedData).then(() =>{
                            increaseCounter(doc, activity.toggle)
                        })
                    }
                });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    if (showLoading) {
        return <IonLoading
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={'Loading ...'}
            duration={5000}
        />
    }

    return (
        <div>
            <div className="title-position">  Activities Today: {todayDate}</div>

            <div className="activity-page">
                {userAndAcitiyList.map((doc: any) => (
                    <div key={doc.id} className="tile-position">
                        <div className="title">{doc.name}</div>
                        <div className="tile">
                            <IonImg className="activity-icon" src={getImageSrc(doc.key)}></IonImg>

                            <div className="second-section">
                                <div className="dot">{doc.count}</div>
                                <IonButton disabled={doc.blur} expand="block" onClick={() => setUserActivity(doc)}>
                                    <IonIcon className={doc.toggle === true ? "selectIcon" : "deselectIcon"} slot="start" icon={handLeft} mode="ios" />
                            I did this</IonButton>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Activities
