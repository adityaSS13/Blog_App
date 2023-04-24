/*We need to modify the article page so that it can adjust based on whether a user is logged in
or not. The functionality to upvote and add comments should only be visible to logged in users */

import { useParams } from "react-router-dom";
//The 'useParams' hook lets us access the parameters of the current route
import articles from "./article-content";
import NotFoundPage from "./NotFoundPage";
import { useEffect, useState } from "react";
/*The 'useEffect' hook allows to add logic into the components that will be executed outside the
normal component rendering. E.g. logic for doing things like loading data from a server. */
import axios from "axios";
import CommentsList from "../components/CommentsList";
import AddCommentForm from "../components/AddCommentForm";
import useUser from "../hooks/useUser";

const ArticlePage = () => {
  const [articleInfo, setArticleInfo] = useState({
    upvotes: 0,
    comments: [],
    canUpvote: false,
  });
  const { canUpvote } = articleInfo;
  const params = useParams();
  /*'params' is an object whose keys are the names that we've given url parameters */
  const articleId = params.articleId; //we can also directly do this above: const { articleId } = useParams();

  const { user, isLoading } = useUser();

  /*
  useEffect(() => {
    setArticleInfo({ upvotes: Math.ceil(Math.random() * 10), comments: [] });
  }, []);//will run into an infinite loop without the second para (empty array)
  */

  /*Now, we need to make a request to the server and set the 'articleInfo' state using the
  'setArticleInfo' function to the data we get back from the server */
  useEffect(() => {
    //can't use async keyword directly for the anonymous func inside useEffect
    const loadArticleInfo = async () => {
      /*In addition to the request, we also need to include 'authtoken' along with this request.
      The authtoken is how the frontend proves that the user is logged in. */
      const token = user && (await user.getIdToken());
      const headers = token ? { authtoken: token } : {};
      const response = await axios.get(
        `http://localhost:8000/api/articles/${articleId}`,
        {
          headers,
        }
      );
      const newArticleInfo = response.data;
      setArticleInfo(newArticleInfo);
    };
    if (!isLoading) {
      loadArticleInfo();
    }
  }, [isLoading, user]);

  const article = articles.find((article) => article.name === articleId);
  // return <h1>This is a article page for the article with id: {articleId}!</h1>;

  const addUpvote = async () => {
    const token = user && (await user.getIdToken());
    const headers = token ? { authtoken: token } : {};
    const response = await axios.put(
      `/api/articles/${articleId}/upvote`,
      null,
      { headers }
    );
    const updatedArticle = response.data;
    setArticleInfo(updatedArticle);
  };

  if (!article) {
    return <NotFoundPage />;
  }

  //The functionality to upvote and add comments should only be visible to logged in users:
  return (
    <>
      <h1>{article.title}</h1>
      <div className="upvotes-section">
        {/*Upvoting possible only if the user is logged in: */}
        {user ? (
          <button onClick={addUpvote}>
            {canUpvote ? "upvote!" : "already upvoted!!"}
          </button>
        ) : (
          <button>Log in to upvote!</button>
        )}
        <p>This article has {articleInfo.upvotes} upvote(s)</p>
      </div>
      {article.content.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {/*Commenting possible only if the user is logged in: */}
      {user ? (
        <AddCommentForm
          articleName={articleId}
          onArticleUpdated={(updatedArticle) => setArticleInfo(updatedArticle)}
        />
      ) : (
        <button>Log in to comment!</button>
      )}

      <CommentsList comments={articleInfo.comments} />
    </>
  );
};

export default ArticlePage;
