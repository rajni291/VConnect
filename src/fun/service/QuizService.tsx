const QuizService = {
    getQuizQuestions: () => {
        const url = 'https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple'
        return fetch(url).then(res => res.json()).then((reponse) =>{
            return QuizService.createQuizModel(reponse.results)
        },
        (error: any) => {
           console.log(error);
          })
    },

    createQuizModel : (quiz : any) =>{
        let QuestionSet: any[] = [];
        quiz.forEach((element: any, i: number) => {
            let data = element.incorrect_answers;
            data.push(element.correct_answer);
            data = shuffleArray(data);
            let aIndex = data.indexOf(element.correct_answer)
            let temp = {
                question : element.question,
                questionIndex: i+1,
                options: data,
                correctAnswer: element.correct_answer,
                answerIndex: aIndex,
            }
            QuestionSet.push(temp);        
        });
        return QuestionSet;
    }
}

function shuffleArray(array: any[]) {
    let i = array.length - 1;
    for (; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

export default QuizService