var express = require('express');
var router = express.Router();
var axios =require('axios');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
var startIndex = 0;
var endIndex = 3;



 
/* GET home page. */
router.get('/', async function(req, res, next) {
  try {


    const iplMatch = await axios('https://api.cricapi.com/v1/currentMatches?apikey=88ce5ac1-d5e9-49fc-804a-856b6ca21140&offset=0');
    const matches = await iplMatch.data.data;
    if (!matches) {
      console.error('No matches found in the response:', iplMatchResponse.data);
      return res.status(500).send('Internal Server Error: No matches found');
    }
    const ongoingMatches = await matches.filter(match => match.status != "Match not started" && match.matchEnded === false);
    const recentMatch =  await ongoingMatches.sort((a, b) => {
      const dateA = new Date(a.dateTimeGMT);
      const dateB = new Date(b.dateTimeGMT);

      return dateB - dateA; // Sort in descending order
  });
    
    const response = await axios('https://cricwww-cms.onrender.com/api/posts?populate=*');
    const blogData = response.data;
    const postData = blogData.data;

    res.render('index', {postData, startIndex, endIndex, recentMatch})
    // res.render('index', { blogData });
  } catch (error) {
    console.error(error); // Handle errors gracefully (e.g., send an error page)
    res.status(500).send('Error: API daily limit exceeded. Please try again later.'); // Or a more informative message
  }
});


router.get('/blog/:id', async (req, res) => {
  const id = req.params.id
  const response = await axios(`https://cricwww-cms.onrender.com/api/posts/${id}?populate=*`);
  const allResponse = await axios('https://cricwww-cms.onrender.com/api/posts/?populate=*');
  const blogPostData = response.data;
  const singlePost = blogPostData.data;
  const Blog = allResponse.data;
  const recentBlog = Blog.data;
 const richText = singlePost.attributes.des;

  function jsonToHtml(jsonData) {
    let html = "";
  
    function processNode(node) {
      switch (node.type) {
        case "heading":
          html += `<h${node.level}>${processNode(node.children[0])}</h${node.level}>`;
          break;
        case "paragraph":
          html += `<p>${node.children.map(processNode).join("")}</p>`;
          break;
        case "list":
          const listType = node.format === "ordered" ? "ol" : "ul";
          html += `<${listType}>`;
          html += node.children.map(processNode).join("");
          html += `</${listType}>`;
          break;
        case "list-item":
          html += `<li>${processNode(node.children[0])}</li>`;
          break;
        case "text":
          let text = node.text;
          if (node.bold) {
            text = `<strong>${text}</strong>`;
          }
          if (node.italic) {
            text = `<i>${text}</i>`;
          }
          if (node.underline) {
            text = `<u>${text}</u>`;
          }
          if (node.strikethrough) {
            text = `<s>${text}</s>`;
          }
          return text;
        case "image":
          html += `<img style="width: 50vw;" src="${node.image.url}" alt="${node.image.alternativeText}" />`;
          break;
        case "quote":
          html += `<blockquote>${processNode(node.children[0])}</blockquote>`;
          break;
        case "link":
          html += `<a href="${node.url}">${processNode(node.children[0])}</a>`;
          break;
        default:
          break;
      }
    }
  
    jsonData.forEach(processNode);
    return html;
  }
  const jsonData = richText;
  const htmlContent = jsonToHtml(jsonData); 

  res.render('blog', {singlePost, recentBlog, htmlContent})
})

router.get('/test', async (req, res) => {
  const response = await axios('https://cricwww-cms.onrender.com/api/posts/11?populate=*');
  const blogData = response.data;
  const postData =blogData.data;
  const data = postData.attributes.des;
 
  res.json(data)

})

router.get('/nextPage', async (req, res) => {
  const response = await axios('https://cricwww-cms.onrender.com/api/posts?populate=*');
  const allPosts = response.data.data;
  
  if (endIndex < allPosts.length) {
      startIndex += 3;
      endIndex += 3;
  }
  else{
    startIndex  = 0;
    endIndex = 3;
  }
  
  res.redirect('/');
});

router.get('/prevPage', async (req, res) => {
  const response = await axios('https://cricwww-cms.onrender.com/api/posts?populate=*');
  const allPosts = response.data.data;
  
  if (startIndex > 0) {
      startIndex -= 3;
      endIndex -= 3;
  }
  
  res.redirect('/');
});


router.get('/ipl-matches', async (req, res) => {
 const response = await axios('https://api.cricapi.com/v1/currentMatches?apikey=0e32e845-c5b7-4fcf-9bb5-6a3fad78e2ff&offset=0')
 res.json(response.data.data)
})

router.get('/fixture', async (req, res) => {
  const options = {
    method: 'POST',
    url: 'https://free-cricket-live-score1.p.rapidapi.com/schedule/upcoming',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '30e2096546msh25496d9f35b184fp15ed6cjsnc60b405c5d89',
      'X-RapidAPI-Host': 'free-cricket-live-score1.p.rapidapi.com'
    },
    data: {
      page_number: 2,
      match_formate: 'T20'
    }
  };
  const options2 = {
    method: 'POST',
    url: 'https://free-cricket-live-score1.p.rapidapi.com/schedule/upcoming',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '30e2096546msh25496d9f35b184fp15ed6cjsnc60b405c5d89',
      'X-RapidAPI-Host': 'free-cricket-live-score1.p.rapidapi.com'
    },
    data: {
      page_number: 1,
      match_formate: 'T20'
    }
  };
  
  try {
    const response = await axios.request(options);
    const resp = await axios.request(options2);
    const womenpl = resp.data.res.matches;
    const fixtureData = response.data.res.matches
    const filteredFixtureData = fixtureData.filter(item => item.srsKey === "ipl_2024");
    const wpl = womenpl.filter(item => item.srsKey === "wpl_2024");
    res.render('fixture', {fixtureData: filteredFixtureData, wpl})
  } catch (error) {
    console.error(error);
  }
})


router.get('/ranking', async (req, res) => {
  const options = {
    method: 'POST',
    url: 'https://free-cricket-live-score1.p.rapidapi.com/ranking/men',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '30e2096546msh25496d9f35b184fp15ed6cjsnc60b405c5d89',
      'X-RapidAPI-Host': 'free-cricket-live-score1.p.rapidapi.com'
    },
    data: {
      match_formate: 't20',
      rank_type: 'bat'
    }
  };

  const odi = {
    method: 'POST',
    url: 'https://free-cricket-live-score1.p.rapidapi.com/ranking/men',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '30e2096546msh25496d9f35b184fp15ed6cjsnc60b405c5d89',
      'X-RapidAPI-Host': 'free-cricket-live-score1.p.rapidapi.com'
    },
    data: {
      match_formate: 'odi',
      rank_type: 'bat'
    }
  };
  const test = {
    method: 'POST',
    url: 'https://free-cricket-live-score1.p.rapidapi.com/ranking/men',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '30e2096546msh25496d9f35b184fp15ed6cjsnc60b405c5d89',
      'X-RapidAPI-Host': 'free-cricket-live-score1.p.rapidapi.com'
    },
    data: {
      match_formate: 'test',
      rank_type: 'bat'
    }
  };
  
  try {
    const response = await axios.request(options);
    const odiResponse = await axios.request(odi);
    const testResponse = await axios.request(test);
    const batRanking = response.data.data['bat-rank'].rank;
    const odiRanking = odiResponse.data.data['bat-rank'].rank;
    const testRanking = testResponse.data.data['bat-rank'].rank;
    // res.json(batRanking)
    res.render('stats', {batRanking, odiRanking, testRanking})
  } catch (error) {
    console.error(error);
  }
})

module.exports = router;
