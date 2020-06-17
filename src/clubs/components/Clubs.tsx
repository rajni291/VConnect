import React, { useEffect, useState } from 'react'
import './Clubs.css';
import { IonIcon, IonSlides, IonSlide, IonImg, IonButton, IonModal, IonInput, IonItem, IonLabel, IonLoading } from '@ionic/react';
import firebase from '../../core/firebase/Firebase';
import { addCircle, people, peopleCircleOutline, help, searchCircle, caretBackCircleOutline, removeCircle, arrowBackOutline, arrowBackCircleOutline, map } from 'ionicons/icons';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase';


type Props = {
    profile: any;
}

const Clubs: React.FC<Props> = ({ profile }) => {
    const slideOpts = {
        initialSlide: 0,
        speed: 400,
    };
    let data: any[] = [];
    // let cData: any[] = [{ user: '', disussions: [{ post: '' }] }]
    let cData: any[] = [];
    let clubList: any[] = [];


    const [showLoading, setShowLoading] = useState(true);
    const [userClubList, setuserClubList] = useState(data);
    const [showFirstModal, setshowFirstModal] = useState(false);
    const [showCreateModal, setshowCreateModal] = useState(false);
    const [clubName, setclubName] = useState<string>();
    const [clubDescription, setclubDescription] = useState<string>();
    const [showClubDiscussion, setshowClubDiscussion] = useState(false);
    let clubData = { name: '', id: '', discussion: [{}], member: 0 };
    const [club, setclub] = useState(clubData);
    const [totalMember, settotalMember] = useState(0);
    const [post, setpost] = useState('');
    const [clubDiscussion, setclubDiscussion] = useState(cData);
    const [showExploreClub, setshowExploreClub] = useState(false);
    const [allClubs, setallClubs] = useState(clubList);

    const fetchData = async () => {
        try {
            let clubs: any[] = [];

            let userClubRef = firebase.firestore().collection('userClub');
            userClubRef.where('user', '==', profile).get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        setshowClubDiscussion(false);
                        setuserClubList(clubs);
                        setShowLoading(false);
                        setshowCreateModal(false);
                    }
                    snapshot.forEach(user => {
                        let tempData: any[] = [];
                        tempData.push(user.data());
                        tempData.forEach(element => {
                            element.clubGroup.forEach((element: any) => {
                                clubs.push(element)
                            });
                        });
                        setshowClubDiscussion(false);
                        setuserClubList(clubs);
                        setShowLoading(false);
                        setshowCreateModal(false);
                    })
                });
        } catch (err) {
            console.error(err);
        }

    };

    const getAllClubs = () => {
        try {
            let userClubRef = firebase.firestore().collection('clubDiscussion');
            userClubRef.get()
                .then(snapshot => {
                    let updatedData: any[] = [];
                    snapshot.forEach(clubData => {
                        let data = clubData.data();
                        let found = false;
                        userClubList.forEach(clubs => {
                            console.log(clubs)
                            let clubItem: any[] = [];
                            clubItem.push(clubs);

                            clubItem[0].clubs.forEach((element: any) => {
                                if (element.id === data.id)
                                    found = true;
                            });
                        });
                        if (!found) {
                            data.following = false;
                            data.selected = false;
                            updatedData.push(data);
                        }
                    })
                    console.log(updatedData);
                    setallClubs(updatedData);
                    setShowLoading(false)
                });
        } catch (err) {
            console.error(err);
        }

    }

    useEffect(() => {
        if (userClubList.length === 0 && showLoading)
            fetchData();
    });

    const addUserClub = (clubName: any, clubDescription: any) => {
        setshowCreateModal(false);
        setShowLoading(true);
        let userClubRef = firebase.firestore().collection('userClub');
        userClubRef.where('user', '==', profile).get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // add multiple clubList
                    let clubGroup = [
                        {
                            clubs: [
                                {
                                    id: uuidv4(),
                                    name: clubName
                                }
                            ]
                        }
                    ]
                    userClubRef.doc().set({
                        user: profile,
                        clubGroup: clubGroup
                    }).then(() => {
                        updateClubMemberCount(clubGroup[0].clubs[0]);
                        setuserClubList(clubGroup);
                        setShowLoading(true);
                        // fetchData();
                    });

                }

                snapshot.forEach(userDoc => {
                    let updatedData = userDoc.data();
                    let newClubUpdateMember = {};
                    let inClubTobeAdded = updatedData.clubGroup.filter((x: any) => x.clubs.length < 4)[0];
                    if (!inClubTobeAdded) {
                        let newClubGroup = {
                            clubs: [
                                {
                                    id: uuidv4(), name: clubName
                                }
                            ]
                        }
                        updatedData.clubGroup.push(newClubGroup);
                        newClubUpdateMember = newClubGroup.clubs[0];
                    }
                    else {
                        let newClub =
                        {
                            id: uuidv4(), name: clubName
                        };

                        console.log(inClubTobeAdded)
                        inClubTobeAdded.clubs.push(newClub);
                        newClubUpdateMember = newClub;
                    }
                    userClubRef.doc(userDoc.id).update(updatedData).then(() => {
                        let newClubList: any[] = [];
                        newClubList.push(updatedData)
                        setuserClubList(newClubList);
                        updateClubMemberCount(newClubUpdateMember);
                        fetchData();
                    });
                });

            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    const exploreClubSelection = (club: any, e: any, myClub = false) => {
        e.stopPropagation();
        let temp: any[] = [];
        if (myClub) {
            userClubList.forEach(clubList => {
                clubList.clubs.forEach((element: any) => {
                    if (element.id === club.id) {
                        element.selected = true;
                    }
                });
                temp.push(clubList);
            });
            setuserClubList(temp);
        }
        else {
            allClubs.forEach(element => {
                if (element.id === club.id) {
                    element.selected = true;
                }
                temp.push(element);
            });
            setallClubs(temp);
        }

        let userClubRef = firebase.firestore().collection('userClub');
        userClubRef.where('user', '==', profile).get()
            .then(snapshot => {
                if (club.following === false) {
                    followClub(club, snapshot, userClubRef);
                } else {
                    removeUserClub(club, snapshot, userClubRef)
                }
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    // both addUserClub and FollowClub should be made generic in future.
    const followClub = (club: any, snapshot: any, userClubRef: any) => {
        club.following = true;
        if (snapshot.empty) {
            // add multiple clubList
            let clubGroup = [
                {
                    clubs: [
                        {
                            id: club.id,
                            name: club.name
                        }
                    ]
                }
            ]
            userClubRef.doc().set({
                user: profile,
                clubGroup: clubGroup
            }).then(() => {
                updateClubMemberCount(clubGroup[0].clubs[0]);
                setuserClubList([...userClubList, clubGroup[0]])
            });

        }

        snapshot.forEach((userDoc: any) => {
            let updatedData = userDoc.data();
            let newClubUpdateMember = {};
            let inClubTobeAdded = updatedData.clubGroup.filter((x: any) => x.clubs.length < 4)[0];
            if (!inClubTobeAdded) {
                let newClubGroup = {
                    clubs: [
                        {
                            id: club.id, name: club.name
                        }
                    ]
                }
                updatedData.clubGroup.push(newClubGroup);
                newClubUpdateMember = newClubGroup.clubs[0];
            }
            else {
                let newClub =
                {
                    id: club.id, name: club.name
                };

                console.log(inClubTobeAdded)
                inClubTobeAdded.clubs.push(newClub);
                newClubUpdateMember = newClub;
            }
            userClubRef.doc(userDoc.id).update(updatedData).then(() => {
                updateClubMemberCount(newClubUpdateMember);
                fetchData();
            });
        });
    }

    const updateClubMemberCount = (club: any, remove = false) => {
        try {
            let userClubRef = firebase.firestore().collection('clubDiscussion');
            userClubRef.where('id', '==', club.id).get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        let updatedData = {}
                        updatedData =
                        {
                            id: club.id,
                            name: club.name,
                            discussions: [],
                            member: 1,
                        }
                        userClubRef.doc().set(updatedData);
                    }
                    snapshot.forEach(clubData => {
                        let updatedData: any[] = [];
                        updatedData.push(clubData.data());
                        updatedData[0].member = remove ? parseInt(updatedData[0].member) - 1 : parseInt(updatedData[0].member) + 1;
                        userClubRef.doc(clubData.id).update(updatedData[0]);
                    })
                    let temp: any[] = [];
                    allClubs.forEach(element => {
                        if (element.id === club.id) {
                            element.selected = false;
                        }
                        temp.push(element);
                    });
                    setallClubs(allClubs);
                });
        } catch (err) {
            console.error(err);
        }

    }

    const removeUserClub = (club: any, snapshot: any, userClubRef: any) => {
        club.following = false;
        snapshot.forEach((userDoc: any) => {
            let updatedData = userDoc.data();
            // let clubGroup = updatedData.clubGroup[0];
            updatedData.clubGroup.forEach((element: any) => {
                let clubGroup = element;
                let inClubTobeAdded = clubGroup.clubs.filter((x: any) => x.id === club.id);
                if (inClubTobeAdded.length > 0) {

                    if (clubGroup.clubs.length > 1) {
                        let index = clubGroup.clubs.indexOf(inClubTobeAdded[0])
                        clubGroup = clubGroup.clubs.splice(index, 1);
                        userClubRef.doc(userDoc.id).update(updatedData).then(() => {
                            club.selected = false;
                            updateClubMemberCount(club, true);
                            let newClubList: any[] = [];
                            updatedData.clubGroup.forEach((element: any) => {
                                newClubList.push(element)
                            });
                            console.log(newClubList);
                            setuserClubList(newClubList);
                        });
                    }

                    else if (clubGroup.clubs.length === 1 && updatedData.clubGroup.length > 1) {
                        let index = updatedData.clubGroup.indexOf(clubGroup)
                        clubGroup = updatedData.clubGroup.splice(index, 1);
                        userClubRef.doc(userDoc.id).update(updatedData).then(() => {
                            club.selected = false;
                            setShowLoading(true);
                            updateClubMemberCount(club, true);
                            fetchData();
                        })
                    }
                    else {
                        userClubRef.doc(userDoc.id).delete().then(() => {
                            club.selected = false;
                            updateClubMemberCount(club, true);
                            let newClubList: any[] = [];
                            setuserClubList(newClubList);
                        });
                    }
                }
            });

        });
    }

    const openDialog = () => {
        setshowFirstModal(true);
    }

    const openCreatePage = () => {
        setshowFirstModal(false);
        setclubName('');
        setclubDescription('');
        setshowCreateModal(true);
    }

    const openExplorePage = () => {
        setShowLoading(true);
        getAllClubs();
        setshowFirstModal(false);
        setshowExploreClub(true);
    }

    const openClubDiscussion = (clubData: any) => {
        setShowLoading(true)
        setshowClubDiscussion(true);
        fetchClubDiscussion(clubData);
        setclub(clubData);
    }

    const goToClubHomepage = () => {
        setpost('')
        setshowClubDiscussion(false);
    }


    const fetchClubDiscussion = (club: any) => {
        try {
            let userClubRef = firebase.firestore().collection('clubDiscussion');
            userClubRef.where('id', '==', club.id).get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        setshowClubDiscussion(true);
                        setShowLoading(false);
                    }
                    snapshot.forEach(user => {
                        let tempData: any[] = [];
                        settotalMember(user.data().member)
                        tempData.push(user.data());
                        setclubDiscussion(tempData);
                        setshowClubDiscussion(true);
                        setShowLoading(false);

                    })
                });
        } catch (err) {
            console.error(err);
        }
    }

    const postClubDiscussion = (post: any) => {
        try {
            let userClubRef = firebase.firestore().collection('clubDiscussion');
            userClubRef.where('id', '==', club.id).get()
                .then(snapshot => {
                    snapshot.forEach(clubData => {
                        let updatedData: any[] = [];
                        updatedData.push(clubData.data());
                        let disussion = {
                            user: profile,
                            post: post
                        }
                        updatedData[0].discussions.push(disussion);
                        userClubRef.doc(clubData.id).update(updatedData[0]).then((data) => {
                            setclubDiscussion(updatedData);
                            setshowClubDiscussion(true);
                            setpost('');
                        });

                    })
                });
        } catch (err) {
            console.error(err);
        }
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

        <div className="club-page">
            {(() => {
                if (showCreateModal) {
                    return (
                        <div className="create-container">
                            <div>
                                <div className="create-back">
                                    <IonIcon icon={arrowBackCircleOutline} onClick={() => setshowCreateModal(false)}></IonIcon>
                                </div>
                                <div className="create-header"> create club</div>
                            </div>
                            <div className="create-body">
                                <IonItem>
                                    <IonLabel position="floating">Club Name</IonLabel>
                                    <IonInput maxlength={30} value={clubName} required
                                        onIonChange={e => setclubName(e.detail.value!)} clearInput autofocus>
                                    </IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">Short Decription</IonLabel>
                                    <IonInput maxlength={50} value={clubDescription}
                                        onIonChange={e => setclubDescription(e.detail.value!)} clearInput autofocus>
                                    </IonInput>
                                </IonItem>
                                <div className="create-button">
                                    <IonButton disabled={!clubName} expand="full" fill="solid" onClick={() => addUserClub(clubName, clubDescription)}>
                                        Create
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    )
                }
                else if (!showCreateModal && !showClubDiscussion && !showExploreClub) {
                    return (
                        <div>
                            <div className="club-header">
                                <div>My Clubs</div>
                                <div className="club-icons">
                                    <IonIcon className="add-icon" icon={addCircle} mode="ios" onClick={() => openCreatePage()} />
                                    <IonIcon className="add-icon" icon={searchCircle} mode="ios" onClick={() => openExplorePage()} />
                                </div>
                            </div>

                            <div className="my-club">
                                {
                                    userClubList.length <= 0 && !showLoading &&
                                    <div className="no-group">

                                        <IonIcon className="group-icon" icon={peopleCircleOutline}></IonIcon>
                                        <IonIcon className="help-icon" icon={help}></IonIcon>
                                        <div>You're not following any clubs</div>
                                        <br />

                                        <div><IonButton color="primary" onClick={() => openDialog()} >Get Started</IonButton></div>

                                        <IonModal onDidDismiss={() => setshowFirstModal(false)}
                                            backdropDismiss={true} cssClass="club-modal-css" isOpen={showFirstModal}>
                                            <div className="club-popoup-body">
                                                <div className="option1">
                                                    <IonIcon className="icon-size" icon={searchCircle} mode="ios" onClick={() => openExplorePage()} />
                                                    Explore
                                                </div>

                                                {/* <div className="or-text">or</div> */}
                                                <div className="option1">
                                                    <IonIcon className="icon-size" icon={addCircle} mode="ios" onClick={() => openCreatePage()} />
                                                    Create
                                                </div>
                                            </div>
                                        </IonModal>
                                    </div>

                                }
                                {
                                    userClubList.length > 0 && <IonSlides pager={true} options={slideOpts} class="my-club">
                                        {
                                            userClubList.map((item, i) =>
                                                <IonSlide key={i}>
                                                    <div className="slide-container" >
                                                        {
                                                            item.clubs.map((club: any, i: number) =>
                                                                <div aria-disabled={club.selected} key={i} className="clubs" onClick={() => openClubDiscussion(club)}>
                                                                    <div className="club-text" title={club.name}>  {club.name} </div>
                                                                    <div>
                                                                        <IonImg className="club-icon" src="/assets/club.png"></IonImg>
                                                                    </div>
                                                                    <div className="icon-size1" onClick={(e) => exploreClubSelection(club, e, true)}>
                                                                        <IonIcon src={removeCircle}></IonIcon>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </IonSlide>
                                            )
                                        }

                                    </IonSlides>
                                }
                            </div>
                        </div>
                    )
                }
                else if (showExploreClub) {
                    return (
                        <div className="create-container">
                            <div className="create-back">
                                <IonIcon icon={arrowBackCircleOutline} onClick={() => setshowExploreClub(false)}></IonIcon>
                            </div>
                            <div className="create-header"> Follow club</div>
                            <div className="create-body explore-body">
                                {
                                    allClubs.map((club, i) =>
                                        <div key={i} aria-disabled={club.selected} className={club.following ? "clubs club-follow" : "clubs"}
                                            onClick={(e) => exploreClubSelection(club, e)}>
                                            <div className="club-text" title={club.name}> {club.name} </div>
                                            <div>
                                                <IonImg className="club-icon" src="/assets/club.png"></IonImg>
                                            </div>
                                            <div>
                                                {
                                                    !club.following &&
                                                    <IonIcon className="icon-size1 icon-position" src={addCircle}></IonIcon>
                                                }
                                                {
                                                    club.following &&
                                                    <IonIcon className="icon-size1 icon-position icon-color" src={removeCircle}></IonIcon>
                                                }
                                            </div>
                                        </div>

                                    )
                                }

                            </div>
                        </div>
                    )
                }
                else if (showClubDiscussion) {
                    return (
                        <div className="create-container">
                            <div>
                                <div className="create-back">
                                    <IonIcon icon={arrowBackCircleOutline} onClick={() => goToClubHomepage()}></IonIcon>
                                </div>
                                <div className="create-header"> {club.name}</div>
                                <div className="followers"> Followers: {totalMember}</div>
                            </div>
                            <div className="post-header">
                                <IonItem className="post-input">
                                    <IonInput value={post} placeholder="Type a new message" onIonChange={e => setpost(e.detail.value!)} clearInput></IonInput>
                                    <IonButton disabled={post === ''} onClick={() => postClubDiscussion(post)} >Post</IonButton>
                                </IonItem>
                            </div>
                            <div style={{ padding: 10, overflowY: 'scroll', height: '400px' }}>
                                {
                                    clubDiscussion.length > 0 && clubDiscussion[0].discussions.slice().reverse().map((item: any, i: number) =>
                                        <div key={i} style={{ padding: '7px', display: 'block', backgroundColor: '#ff00002b', marginBottom: '5px' }}>
                                            <div className="chat-name" >{item.user}</div>
                                            <div> {item.post}</div>
                                        </div>

                                    )
                                }
                            </div>
                        </div>
                    )
                }
            })()}

        </div>

    )
}

export default Clubs
