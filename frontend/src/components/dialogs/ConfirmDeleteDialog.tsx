import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import React from "react";
import { ConfirmDeleteDialogProps } from "../../types";

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    open,
    closeHandler,
    deleteHandler,
}) => {
    return (
        <Dialog open={open} onClose={closeHandler}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this group?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeHandler}>Cancel</Button>
                <Button onClick={deleteHandler} color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;