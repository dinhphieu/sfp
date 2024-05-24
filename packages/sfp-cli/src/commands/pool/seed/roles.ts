import { AnyJson } from '@salesforce/ts-types';
import poolListImpl from '../../../core/scratchorg/pool/PoolListImpl';
import poolListImpl2 from '../../../core/scratchorg/pool/PoolListImpl2';
import ScratchOrg from '../../../core/scratchorg/ScratchOrg';
import SFPLogger, { LoggerLevel } from '@flxbl-io/sfp-logger';
import { Messages } from '@salesforce/core';
import SfpCommand from '../../../SfpCommand';
import { Flags, ux } from '@oclif/core';
import { loglevel, orgApiVersionFlagSfdxStyle, targetdevhubusername } from '../../../flags/sfdxflags';
// import { migrateUserRoles } from './migrateUserRoles.js';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@flxbl-io/sfp', 'scratchorg_poollist');

export default class List extends SfpCommand {
    public static description = messages.getMessage('commandDescription');

    protected static requiresDevhubUsername = true;
    public static enableJsonFlag = true;

    public static examples = [
        `$ sfp pool:list -t core `,
        `$ sfp pool:list -t core -v devhub`,
        `$ sfp pool:list -t core -v devhub -m`,
        `$ sfp pool:list -t core -v devhub -m -a`,
    ];

    public static flags = {
        targetdevhubusername,
        'apiversion': orgApiVersionFlagSfdxStyle,
        allscratchorgs: Flags.boolean({
            char: 'a',
            description: messages.getMessage('allscratchorgsDescription'),
            required: false,
        }),
        loglevel,
        metadata: Flags.string({
            char: 'm',
            description: 'Metadata to be migrated',
            required: false,
        }),
        'from-org': Flags.string({
            char: 'f',
            description: 'Source org',
            required: false,
        })
    };

    public async execute(): Promise<any> {
        await this.hubOrg.refreshAuth();
        const hubConn = this.hubOrg.getConnection();

        this.flags.apiversion = this.flags.apiversion || (await hubConn.retrieveMaxApiVersion());
        // let listImpl = new poolListImpl(this.hubOrg, this.flags.tag, this.flags.allscratchorgs);
        let listImpl = new poolListImpl2(this.hubOrg, this.flags.tag, this.flags.allscratchorgs);
        let result = (await listImpl.execute()) as ScratchOrg[];

        let scratchOrgInuse = result.filter((element) => element.status === 'In use');
        let scratchOrgNotInuse = result.filter((element) => element.status === 'Available');
        let scratchOrgInProvision = result.filter((element) => element.status === 'Provisioning in progress');

        // if (!this.flags.json) {
        //     if (result.length > 0) {
        //         ux.log(`======== Scratch org Details ========`);
        //
        //         if (!this.flags.tag) {
        //             ux.log(`List of all the pools in the org`);
        //
        //             this.logTagCount(result);
        //             ux.log('===================================');
        //         }
        //
        //         if (this.flags.allscratchorgs) {
        //             ux.log(`Used Scratch Orgs in the pool: ${scratchOrgInuse.length}`);
        //         }
        //         ux.log(`Unused Scratch Orgs in the Pool : ${scratchOrgNotInuse.length} \n`);
        //         if (scratchOrgInProvision.length && scratchOrgInProvision.length > 0) {
        //             ux.log(`Scratch Orgs being provisioned in the Pool : ${scratchOrgInProvision.length} \n`);
        //         }
        //
        //         if (this.flags.mypool) {
        //            // ux.table(result, {'tag':{}, 'orgId':{}, 'username':{}, 'password':{}, 'expiryDate':{}, 'status':{}, 'loginURL':{}});
        //         } else {
        //             //ux.table(result, ['tag', 'orgId', 'username', 'expiryDate', 'status', 'loginURL']);
        //         }
        //     } else {
        //         SFPLogger.log(`No Scratch orgs available, time to create your pool.`, LoggerLevel.ERROR);
        //     }
        // }

        // console.log(this.flags)

        if (this.flags.metadata) {
            let metadata = this.flags.metadata.split(',');

            // If metadata has Role
            if (metadata.includes('Role')) {
                // Convert bash cmd to js
                // node scripts/ci/migrateUserRoles.js --source-org "$UAT_ORG_ALIAS" --target-org "$SCRATCH_ORG_ALIAS"
                // migrateUserRoles('UAT_ORG_ALIAS', 'SCRATCH_ORG_ALIAS');
            }
        }

        let output = {
            total: scratchOrgInuse.length + scratchOrgNotInuse.length + scratchOrgInProvision.length,
            inuse: scratchOrgInuse.length,
            unused: scratchOrgNotInuse.length,
            inprovision: scratchOrgInProvision.length,
            scratchOrgDetails: result,
        };

        return 'yoo'; // output;
    }

    private getRolesFromOrgs(orgAlias: string) {

    }

    private logTagCount(result: ScratchOrg[]) {
        let tagCounts: any = result.reduce(function(obj, v) {
            obj[v.tag] = (obj[v.tag] || 0) + 1;
            return obj;
        }, {});

        let tagArray = new Array<any>();

        Object.keys(tagCounts).forEach(function(key) {
            tagArray.push({
                tag: key,
                count: tagCounts[key],
            });
        });

        ux.table(tagArray, { 'tag': {}, 'count': {} });
    }
}
