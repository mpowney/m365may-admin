import * as React from "react";

import DocumentMeta from "react-document-meta";
import Navigation from "../components/Navigation";
import Header from "../components/Header";

const styles = require("../assets/styles/entries/Home.module.scss");
const meta = {
    title: "Dashboard",
    description: "",
    meta: {
        charset: "utf-8",
        name: {
            keywords: "Home"
        }
    }
};

interface HomeProps {}
interface HomeState {}

export default class HomeEntry extends React.Component<HomeProps, HomeState> {
    static STORE_CLASSES = [];

    render() {
        return (
            <>
                <Navigation />
                <main id={`viewport`} className={styles.home}>
                    <DocumentMeta {...meta} />
                    <Header />
                    <h1>Dashboard</h1>
                </main>
            </>
        );
    }
}
