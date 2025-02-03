import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(theme => ({
    tag: {
        padding: "1px 5px",
        borderRadius: "3px",
        fontSize: "0.8em",
        fontWeight: "300",
        color: "#FFF",
        marginRight: "5px",
        whiteSpace: "nowrap",
        maxWidth: "90px",
        overflow: "hidden",
        border: "1px solid #ffffff50"
    }
}));

const ContactTag = ({ tag }) => {
    const classes = useStyles();

    return (
        <div className={classes.tag} style={{ backgroundColor: tag.color, marginTop: "2px" }}>
            {tag.name.toUpperCase()}
        </div>
    )
}

export default ContactTag;  