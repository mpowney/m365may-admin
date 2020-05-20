import * as React from "react";
import DocumentMeta from "react-document-meta";

const styles = require("../assets/styles/entries/NotFound.module.scss");
const bg = require("../assets/images/404.jpg");
const meta = {
    title: "404 Not Found",
    description: "",
    meta: {
        charset: "utf-8",
        name: {
            keywords: "Not found"
        }
    }
};

interface NotFoundEntryProps {}
interface NotFoundEntryState {}

export default class NotFoundEntry extends React.Component<NotFoundEntryProps, NotFoundEntryState> {
    static STORE_CLASSES = [];

    render() {
        return (
            <div>
                <DocumentMeta {...meta} />
                <div className={styles.bgBox} style={{ backgroundImage: `url(${bg})` }} />
                <div className={styles.contentBox}>
                    <div className={styles.text}>Oops! Page not found</div>
                    <div className={styles.btn}>
                        <a href="/" className="ButtonBox">
                            Go Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
