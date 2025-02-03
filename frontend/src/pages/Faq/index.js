import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Input, Select, MenuItem, InputAdornment } from "@material-ui/core";
import { Search } from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";

// Estilos personalizados
const useStyles = makeStyles((theme) => ({
  divMain: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Alinha o conteúdo para o topo
    backgroundColor: "#fff",
    color: "#333",
    marginTop: "1rem",
    padding: "20px 10px",
  },
  textMain: {
    fontSize: "36px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "1rem",
    color: "#d32f2f",
  },
  subTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#d32f2f",
    marginBottom: "2rem", // Maior espaço entre título e conteúdo
  },
  searchContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    width: "100%",
    maxWidth: "900px", // Mais largura para a área de pesquisa
    flexDirection: "row", // Alinha horizontalmente
  },
  searchInput: {
    width: "100%",
    maxWidth: "500px", // Maior largura para o input
    padding: "12px 20px",
    border: "1px solid #d32f2f", 
    borderRadius: "25px", 
    color: "#333",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    "& .MuiInput-underline:before, & .MuiInput-underline:after": {
      border: "none", 
    },
  },
  selectCategory: {
    width: "100%",
    maxWidth: "200px",  // Tamanho moderado para categoria
    padding: "12px 20px",
    border: "1px solid #d32f2f",
    borderRadius: "25px", 
    color: "#333",
    fontSize: "14px",  
    marginBottom: "1rem",
    "& .MuiInput-underline:before, & .MuiInput-underline:after": {
      border: "none", 
    },
  },
  faqItemContainer: {
    width: "100%",
    maxWidth: "800px",
    marginBottom: "1.5rem", // Mais espaço entre os itens
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)", // Sombra mais pronunciada
    padding: "20px",
    border: "1px solid #ddd",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease", // Transição suave
    "&:hover": {
      transform: "scale(1.05)", // Efeito de hover para dar destaque
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    },
  },
  faqQuestion: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#d32f2f", 
    cursor: "pointer",
    marginBottom: "10px",
  },
  faqAnswer: {
    fontSize: "16px",
    color: "#555",
    marginTop: "10px",
    padding: "10px",
    borderTop: "1px solid #ddd",
    transition: "max-height 0.3s ease-in-out", // Suavizar a transição da resposta
    maxHeight: "0px",
    overflow: "hidden",
    opacity: 0,
    "&.open": {
      maxHeight: "500px", // Aumenta o tamanho quando aberto
      opacity: 1,
    }
  },
  noResults: {
    textAlign: "center",
    color: "red",
    marginTop: "2rem", // Mais espaço para a mensagem de erro
  },
  illustration: {
    marginTop: "2rem",
    width: "80%",
    maxWidth: "600px",
    height: "auto",
    display: "block",
    marginBottom: "2rem",
  },
}));

const FAQItem = ({ item, isOpen, toggleOpen }) => {
  const classes = useStyles();
  return (
    <div className={classes.faqItemContainer}>
      <div className={classes.faqQuestion} onClick={toggleOpen}>
        {item.question}
      </div>
      <div className={`${classes.faqAnswer} ${isOpen ? 'open' : ''}`}>
        {item.answer}
      </div>
    </div>
  );
};

const Faq = () => {
  const classes = useStyles();

  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const faqData = [
    { question: "O que é React?", answer: "React é uma biblioteca JavaScript para construção de interfaces de usuário.", category: "Tecnologia" },
    { question: "Como utilizar hooks?", answer: "Hooks são funções especiais do React que permitem o uso de estado e outros recursos sem escrever uma classe.", category: "Tecnologia" },
    { question: "O que é JSX?", answer: "JSX é uma sintaxe de JavaScript que permite escrever HTML dentro de JavaScript.", category: "JavaScript" },
    { question: "O que é o Redux?", answer: "Redux é uma biblioteca para gerenciamento de estado em aplicações JavaScript.", category: "Tecnologia" },
    { question: "Como faço para alterar minha senha?", answer: "Vá até as configurações de sua conta e clique em 'Alterar senha'.", category: "Conta" },
    { question: "Como faço uma compra?", answer: "Selecione o produto e adicione ao carrinho. Em seguida, complete o processo de checkout.", category: "Compras" },
  ];

  const categories = ["Todas", ...Array.from(new Set(faqData.map((item) => item.category)))];

  const filteredFAQ = faqData.filter(
    (item) =>
      (selectedCategory === "Todas" || item.category === selectedCategory) &&
      (item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <MainContainer>
      <div className={classes.divMain}>
        <h1 className={classes.textMain}>Central de Ajuda</h1>

        <h2 className={classes.subTitle}>Perguntas Frequentes</h2>

        <div className={classes.searchContainer}>
          <Input
            className={classes.searchInput}
            type="text"
            placeholder="Pesquisar FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search style={{ color: "#d32f2f" }} />
              </InputAdornment>
            }
            disableUnderline 
          />
          <Select
            className={classes.selectCategory}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disableUnderline 
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </div>

        {filteredFAQ.map((item, index) => (
          <FAQItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            toggleOpen={() => toggleFAQ(index)}
          />
        ))}

        {filteredFAQ.length === 0 && (
          <p className={classes.noResults}>Nenhuma pergunta encontrada. Tente uma pesquisa diferente.</p>
        )}
      </div>
    </MainContainer>
  );
};

export default Faq;
