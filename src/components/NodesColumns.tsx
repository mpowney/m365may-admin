import * as React from "react";
import { IColumn } from "office-ui-fabric-react/lib/DetailsList";
import { Shimmer } from "office-ui-fabric-react/lib/Shimmer";
import { Icon } from "office-ui-fabric-react/lib/Icon";

import ISortingInformation from "../common/utils/ISortingInformation";
import { IDomain } from "../entries/Nodes"

const styles = require("../assets/styles/components/NodesColumns.module.scss");

export default class DomainsColumns {
    public Columns(
        onColumnClick: any,
        sorting: ISortingInformation[],
        isLoading: boolean
    ): IColumn[] {

        let columns = [
            {
                key: `rowKey`,
                name: "Domain",
                fieldName: "rowKey",
                minWidth: 100,
                maxWidth: 200,
                isRowHeader: true,
                isResizable: true,
                sortAscendingAriaLabel: "Sorted A to Z",
                sortDescendingAriaLabel: "Sorted Z to A",
                data: "string",
                onColumnClick: (event: any, column: any) => {
                    onColumnClick(event, column);
                },
                onRender: (item: IDomain) => {
                    return isLoading ? (
                        <Shimmer width={`${60 + Math.floor(Math.random() * 20)}%`} />
                    ) : (
                        <>{item.rowKey}</>
                    );
                },
                isPadded: true
            },
            {
                key: `configuration`,
                name: "Configuration",
                fieldName: "configured",
                minWidth: 60,
                maxWidth: 100,
                isRowHeader: true,
                isResizable: true,
                sortAscendingAriaLabel: "Sorted A to Z",
                sortDescendingAriaLabel: "Sorted Z to A",
                data: "string",
                onColumnClick: (event: any, column: any) => {
                    onColumnClick(event, column);
                },
                onRender: (item: IDomain) => {
                    return !isLoading && (<>
                        {item.configured ? 
                            <Icon iconName={`CompletedSolid`} className={`${styles.configIcon} ${styles.configComplete}`} />
                        :
                            <Icon iconName={'WarningSolid'} className={`${styles.configIcon} ${styles.configIncomplete}`} />
                        }
                        {item.sslConfigured ? 
                            <Icon iconName={`LockSolid`} className={`${styles.configIcon} ${styles.configComplete}`} />
                        :
                            <Icon iconName={'Unlock'} className={`${styles.configIcon} ${styles.noSSL}`} />
                        }
                    </>);
                },
                isPadded: true
            }
        ];

        return columns.map(column => {
            const sortField = sorting.filter(sort => {
                return sort.fieldName === column.fieldName;
            });
            if (sortField.length > 0) {
                return { ...column, ...sortField[0] };
            } else {
                return { ...column };
            }
        });
    }
}
