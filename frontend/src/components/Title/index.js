import React from "react";
import Typography from "@material-ui/core/Typography";

export default function Title(props) {
	return (
		<Typography variant="h5" color="primary" gutterBottom style={{ fontWeight: "bold"}}> 
			{props.children}
		</Typography>
	);
}
