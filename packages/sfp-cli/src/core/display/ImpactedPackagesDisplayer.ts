import SFPLogger, { Logger, LoggerLevel } from '@flxbl-io/sfp-logger';
import { ZERO_BORDER_TABLE } from './TableConstants';
const Table = require('cli-table');

export default class ImpactedPackagesDisplayer {

    public static displayImpactedPackages(packagesToBeBuilt: Map<string, any>,logger:Logger) {
        let tableHead = ['Package', 'Reason', 'Last Known Commit Id/Tag'];
        let table = new Table({
            head: tableHead,
            chars: ZERO_BORDER_TABLE,
        });
        for (const pkg of packagesToBeBuilt.keys()) {
            let item = [
                pkg,
                packagesToBeBuilt.get(pkg).reason,
                packagesToBeBuilt.get(pkg).tag ? packagesToBeBuilt.get(pkg).tag : '',
            ];
            table.push(item);
        }
         //Log Packages to be built
         SFPLogger.log(table.toString(),LoggerLevel.INFO,logger);
    }

}
