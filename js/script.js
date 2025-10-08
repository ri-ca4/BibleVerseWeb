const submitBtn = document.getElementById("submit");
const transSelect = document.getElementById("translation");
const quantityField = document.getElementById("quantity");
const outputDiv = document.getElementById('output');

const translations = [
   "ENGWEBP", "eng_asv", "eng_kjv", "eng_kja", "eng_ylt", "eng_glw", "BSB", "eng_net", "eng_ojb", "eng_weu"
]

const getVariables = async (trans) => {
    try {
        const response = await fetch(`https://bible.helloao.org/api/${trans}/books.json`);

        if (!response.ok) {
            throw new Error(`Failed to fetch book list. Status: ${response.status}`);
        }

        const booksData = await response.json(); 

        const bookList = booksData.books;
        const bookIndex = Math.floor(Math.random() * bookList.length);
        const randBook = bookList[bookIndex];

        const randChap = Math.floor(Math.random() * randBook.numberOfChapters) + 1;

        const variables = [randBook, randChap];
        return variables; 

    } catch (error) {
        console.error('Error in fetching book/chapter variables:', error);
        return null; 
    }
}

const fetchChapterContent = async (trans) => {
    const variablesArray = await getVariables(trans);

    if(!variablesArray) {
        console.error("couldn't proceed, failed to get book/chapter variables");
        return null;
    }

    const [randBook, randChap] = variablesArray;
    const bookID = randBook.id;
    const API_URL = `https://bible.helloao.org/api/${trans}/${bookID}/${randChap}.json`;

    console.log(`fetching: ${API_URL}`);

        try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch book list. Status: ${response.status}`);
        }
        
        const chapData = await response.json();
        //console.log(chapData);
        const verses = chapData.numberOfVerses;
        const verseIndex = Math.floor((Math.random() * verses));

        const randVerseObject = chapData.chapter.content[verseIndex];

        return({variables: variablesArray, verseObject: randVerseObject});
        
    } catch (error) {
        console.error('Error in fetching random chapter', error);
        return null; 
    }
}

const handleSubmit = async () => {
    let translation = transSelect.value;
    const quantity = quantityField.value;

    if(translation==="random"){
       let index = Math.floor((Math.random() * translations.length));
       translation = translations[index];
        //console.log(translation)
    }

    outputDiv.innerHTML = 'Fetching your verses... This may take a moment';
    outputDiv.classList.remove('hide');

    let randomVerseObjects = [];

    while(randomVerseObjects.length < quantity){
        const response = await fetchChapterContent(translation);
        if(response && response.verseObject && response.verseObject.content && response.verseObject.content.length > 0){
            randomVerseObjects.push(response);
        }
    }

    console.log(randomVerseObjects);

    outputDiv.innerHTML='';

    randomVerseObjects.forEach((object)=>{

        let verseHtml = '<p class="verse">';
        const verseArray = object.verseObject.content;
        console.log(verseArray)

        verseArray.forEach((item)=>{
            if (typeof item === 'string') {
                verseHtml += item;
            }else if(typeof item === 'object' && item.text){
                verseHtml += item.text;
            }

            verseHtml += ' ';
        });

        console.log(verseHtml);

        const verseRef = `${object.variables[0].name} ${object.variables[1]}:${object.verseObject.number}`;
        console.log(verseRef);
        verseHtml+= ` -${verseRef}</p>`;
        outputDiv.innerHTML+=verseHtml;
    });
    
};


submitBtn.addEventListener('click', handleSubmit);
