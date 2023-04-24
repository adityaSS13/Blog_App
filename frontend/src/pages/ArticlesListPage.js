import ArticlesList from "../components/ArticlesList";
import articles from "./article-content";

const ArticlesListPage = () => {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Articles:</h1>
      {/*We pass the imported articles as a prop as that offers more flexibility in displaying
      the articles (for eg., if we want to group some articles together and display them) */}
      <ArticlesList articles={articles} />
    </>
  );
};

export default ArticlesListPage;
