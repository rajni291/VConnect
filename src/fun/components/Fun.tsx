import React, { useState, useEffect } from 'react';
import { IonItem, IonGrid, IonRow, IonCol, IonCardContent, IonAlert, IonLabel, IonButton, IonRadio, IonList, IonListHeader, IonRadioGroup, IonCard, IonCardHeader, IonCardTitle, IonLoading, IonImg } from '@ionic/react';
import firebase from '../../core/firebase/Firebase';
import './Fun.css';
import QuizService from '../service/QuizService';
import Parser from 'html-react-parser';
type Props = {
    profile: any;
}

const Fun: React.FC<Props> = ({ profile }) => {
    let quizData: any[] = [];
    const [Quiz, setQuiz] = useState(quizData);
    const [nextBtnCls, setnextBtnCls] = useState<any>("ion-show");

    const [KeyValue, setKeyValue] = useState<number>(0);
    const [selected, setSelected] = useState<number>(-1);

    let [score, setscore] = useState(0);
    const [Result, setResult] = useState<any>('');
    const [cardResult, setcardResult] = useState<any>("ion-hide");
    const [quizRow, setquizRow] = useState<any>("ion-show");
    const [playGameResult, setplayGameResult] = useState<any>("ion-hide");
    const [leaderBoard, setleaderBoard] = useState<any>("ion-hide");
    const [quizSubmitted, setquizSubmitted] = useState(false);

    let data: any[] = []
    const [allscores, setallscores] = useState(data);
    const [showLoading, setshowLoading] = useState(true);

    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (showLoading) {
            isQuizSubmitted();
            if (Quiz.length === 0) {
                QuizService.getQuizQuestions().then((response) => {
                    if (response && response.length > 0) {
                        setQuiz(response);
                        setshowLoading(false);
                    }
                })
            }
        }
    })
    useEffect(() => {
       if(KeyValue === 4){
        submitScore();
        setResultMessage();
        setshowLoading(true);
        setcardResult("ion-show");
        setleaderBoard("ion-show")
        setquizRow("ion-hide");
        setnextBtnCls("ion-hide");
       }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [score])
    const Next = () => {

        if (selected < 0) {
            setError('Please select answer');
            return;
        }
        if (selected === Quiz[KeyValue].answerIndex) {
            // let score : number = -1;
            let data = [score + 1];
            setscore(data[0]);

        }
        if (KeyValue <= 3) {
            const key = KeyValue + 1;
            setKeyValue(key);
        }
        setSelected(-1);
    };

    const setResultMessage = () => {
        if (score >= 3) {
            setResult('Congratulations!!!');
            setplayGameResult("ion-text-center ion-show");
        }
        else {
            setResult('Better luck next time !!!');
            setplayGameResult("ion-text-center ion-hide");
        }
    }

    const submitScore = () => {
        try {
            const today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setMilliseconds(0);
            today.setSeconds(0);
            let userScoreRef = firebase.firestore().collection('quiz');
            userScoreRef.where('createdDate', '>=', today).get()
                .then(snapshot => {
                    if (snapshot.empty) {

                        userScoreRef.doc().set({
                            Score: [
                                {
                                    score: score,
                                    user: profile
                                }
                            ],
                            createdDate: today
                        }).then(() => {
                            getTodaysScoreForStudents();
                        });

                    }

                    snapshot.forEach(studentScore => {
                        let updatedData = studentScore.data();
                        let result = {
                            score: score,
                            user: profile
                        }
                        updatedData.Score.push(result);

                        userScoreRef.doc(studentScore.id).update(updatedData).then(() => {
                            getTodaysScoreForStudents();
                        });
                    })
                });
        } catch (err) {
            console.error(err);
        }

    }

    const getTodaysScoreForStudents = () => {
        try {
            const today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setMilliseconds(0);
            today.setSeconds(0);
            let userClubRef = firebase.firestore().collection('quiz');
            userClubRef.where('createdDate', '>=', today).get()
                .then(snapshot => {
                    snapshot.forEach(studentScore => {
                        let tempData: any[] = [];
                        tempData.push(studentScore.data());
                        tempData.forEach((record: any) => {
                            data.push(record.Score);

                            data[0].sort(function (a: any, b: any) {
                                return b.score - a.score
                            })
                            setallscores(data);
                            setshowLoading(false);
                        });
                    })
                });
        } catch (err) {
            console.error(err);
        }
    }

    const isQuizSubmitted = () => {
        try {
            const today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setMilliseconds(0);
            today.setSeconds(0);
            let userClubRef = firebase.firestore().collection('quiz');
            userClubRef.where('createdDate', '>=', today).get()
                .then(snapshot => {
                    snapshot.forEach(studentScore => {
                        let tempData: any[] = [];
                        tempData.push(studentScore.data());
                        let userPresent = tempData[0].Score.filter((x: any) => x.user === profile);
                        if (userPresent.length > 0) {
                            getTodaysScoreForStudents()
                            // setshowLoading(false);
                            setcardResult("ion-show");
                            setleaderBoard("ion-show")
                            setscore(userPresent[0].score);
                            setResultMessage();
                            setquizSubmitted(true);
                        }


                    })
                });
        } catch (err) {
            console.error(err);
        }
    }

    if (showLoading) {
        return <IonLoading
            isOpen={showLoading}
            onDidDismiss={() => setshowLoading(false)}
            message={'Loading ...'}
            duration={5000}
        />
    }

    if (!showLoading && Quiz.length === 0) {
        return (
            <div className="error-div">
                <span>Please try again later! </span>
                <div>Something went wrong </div>
                <IonImg className="error-icon" src="/assets/error.png"></IonImg>
            </div>
        )
    }


    // var todayDate = moment().format("DD/MM/YYYY");
    return (

        <div>
            <div className="create-header">
                <span>Fun Quiz</span>
            </div>
            {

                <IonGrid className="quiz-container">
                    {
                        !quizSubmitted &&
                        <IonRow className={quizRow}>
                            <IonCol>
                                <IonAlert isOpen={error !== ''} message={error}
                                    buttons={['OK']} onDidDismiss={() => setError('')}
                                />
                                <IonList>
                                    <IonRadioGroup value={selected} onIonChange={e => setSelected(e.detail.value)}>
                                        <IonListHeader className="question">
                                            <IonLabel className="question-label">{Quiz[KeyValue].questionIndex}) {Parser(Quiz[KeyValue].question)}</IonLabel>
                                        </IonListHeader>
                                        {
                                            Quiz[KeyValue].options.map((option: any, i: number) => (
                                                <div key={i} className={selected>=0 && i === Quiz[KeyValue].answerIndex? "right": "no-answer"}>
                                                    <IonItem>
                                                        <IonLabel className="ion-text-wrap">{Parser(option)}</IonLabel>
                                                        <IonRadio slot="start" value={i} disabled={selected >= 0}/>
                                                    </IonItem>
                                                </div>

                                            ))
                                        }
                                        <div className="ion-float-right">
                                            <IonCol className={nextBtnCls}>
                                                <IonButton onClick={() => Next()}> {KeyValue <= 3 ? "Next" : "Submit"} </IonButton>
                                            </IonCol>
                                        </div>
                                    </IonRadioGroup>
                                </IonList>
                            </IonCol>
                        </IonRow>
                    }
                    <IonRow className={cardResult}>
                        <IonCol>
                            <IonCard>

                                <IonCardHeader className="result">
                                    <IonCardTitle className="result-title">
                                        {Result}
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent className="result-content">
                                    <h1 className="ion-text-center">Your Score Is {score}</h1>
                                    {/* <h6 className={playGameResult}>Now you can able to play a game...</h6> */}
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>

                    <IonRow className={leaderBoard}>
                        <IonCol>
                            <IonCard className="leaderboard">
                                <IonCardHeader className="board-color">
                                    <IonCardTitle>Leaderboard</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent className="score-container">
                                    <IonItem className="score">
                                        <div className="rank-table">
                                            <table >
                                                <thead>
                                                    <tr className="board-row">
                                                        <th className="header-row">Rank</th>
                                                        <th className="header-row">Name</th>
                                                        <th className="header-row">Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {

                                                        allscores.map((Scores: any) =>
                                                            Scores.map((record: any, i: number) =>
                                                                <tr className="header-row" key={i}>
                                                                    <td className="board-row">{i + 1}</td>
                                                                    <td className="board-row">{record.user}</td>
                                                                    <td className="board-row">{record.score}</td>
                                                                </tr>
                                                            )

                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>


                                    </IonItem>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

            }
        </div>
    );

};

export default Fun;