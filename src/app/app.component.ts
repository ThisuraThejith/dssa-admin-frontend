import {Component, OnInit} from '@angular/core';
import APP_CONFIG from './app.config';
import {Node, Link} from './d3';
import {NEODictionary} from './d3/models/dictionary';
import {Http, Response, Headers} from '@angular/http';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/index';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [],
    styleUrls: ['./app.component.css']
})

export class AppComponent {
    nodes: Node[] = [];
    links: Link[] = [];
    counter: number;

    fieldArray: Array<any> = [];
    nodeLabel: string;
    newAttribute: any = {};
    fieldArrayRel: Array<any> = [];

    ontologyDropdown: any;
    relSourceDropdown: any;
    relType: string;
    relDirectionDropdown: any;
    relDestinationDropdown: any;
    addNodeForm: any;
    addRelForm: any;
    name = 'Name';
    value = 'Value';
    isEditItems: boolean;
    isEditItemsRel: boolean;
    relationshipSourceDropdown: any;
    relationhipDestinationDropdown: any;
    apiUrl = 'http://ontology-api-dev.jtzupwqmvj.us-east-1.elasticbeanstalk.com/ontology';

    constructor(private http: HttpClient) {
        this.ontologyDropdown = 'All';
        this.relSourceDropdown = 'select';
        this.relDirectionDropdown = 'nodirection';
        this.relDestinationDropdown = 'select';
        this.setJsonData('All');

        this.onEditCloseItems();
        this.fieldArray.push({name: 'name', value: ''});
        this.fieldArray.push({name: 'increase', value: 0.0});
        this.fieldArray.push({name: 'decrease', value: 0.0});
    }

    async setJsonData(domain) {
        await this.getConfigData(domain).then(
            response => {
                this.counter = 5;
                console.log('counter is' + this.counter);
                this.creategraph(response);
            },
            err => {
                console.log('error occured');
                // Promise fail error handling
            });
    }

    async setDropDownNodes(domain) {
        await this.getDropdownNodes(domain).then(
            response => {
                this.relationshipSourceDropdown = response;
                this.relationhipDestinationDropdown = response;
            },
            err => {
                console.log('error occured');
                // Promise fail error handling
            });
    }
    creategraph(response): void {
        // console.log('Promise success nodes' + response.nodes['12']['id']);
        const N = APP_CONFIG.N,
            getIndex = number => number - 1;

        const local_nodes_dict = new NEODictionary<string, Node>();
        const nodes = response['nodes'];
        const keys = Object.keys(nodes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const node_obj = nodes[key];
            const properties = node_obj['propertyList'];
            const propDict = new NEODictionary<string, string>();
            for (let prop_id = 0; prop_id < properties.length; prop_id++) {
                const prop = properties[prop_id];
                propDict.put(prop['key'], prop['value']);
            }
            const node = new Node(i + 1, propDict.get('name'), propDict);
            this.nodes.push(node);
            local_nodes_dict.put(key, node);
        }
        const local_relationships: Link[] = [];
        const relatioships = response['relationships'];
        const rel_keys = Object.keys(relatioships);
        for (let i = 0; i < rel_keys.length; i++) {
            const rel_key = rel_keys[i];
            const rel_obj = relatioships[rel_key];
            const source = rel_obj['startNode'];
            const target = rel_obj['endNode'];
            const rel_name = rel_obj['type'];
            const properties = rel_obj['propertyList'];
            const relPropDict = new NEODictionary<string, string>();
            for (let rel_prop_id = 0; rel_prop_id < properties.length; rel_prop_id++) {
                const rel_prop = properties[rel_prop_id];
                relPropDict.put(rel_prop['key'], rel_prop['value']);
            }
            const source_id = local_nodes_dict.get(source).id;
            const target_id = local_nodes_dict.get(target).id;
            this.nodes[getIndex(source_id)].linkCount++;
            this.nodes[getIndex(target_id)].linkCount++;
            const relationship = new Link(this.nodes[getIndex(source_id)], this.nodes[getIndex(target_id)], rel_name, relPropDict);
            this.links.push(relationship);
        }
    };

    getConfigData(domain): Promise<Observable<Response>> {
        console.log('Get ConfigData');
        return new Promise(resolve => {
            let r: any;
            this.http.get(this.apiUrl + '/get_domain_database?domain=' + domain)
                .subscribe(
                data => {
                    r = data;
                    console.log(data);
                },
                error => {
                    console.log('Yup an error occurred', error);
                    return Observable.throw(error.message || error);
                    // Config error handling.
                },
                () => {
                    resolve(r);
                }
            )
        });
    }

    getDropdownNodes(domain): Promise<Observable<Response>> {
        console.log('Get DropdownData ' + domain);
        return new Promise(resolve => {
            let n: any;
            this.http.get(this.apiUrl + '/get_dropdown_domain_nodes?domain=' + domain).subscribe(
                data => {
                    n = data;
                    // this.relationshipSourceDropdown = data;
                    console.log('drop down nodes = ' + data);
                },
                error => {
                    console.log('Yup an error occurred', error);
                    return Observable.throw(error.message || error);
                    // Config error handling.
                },
                () => {
                    resolve(n);
                }
            )
        });
    }

    getDomainDatabase(domain): void {
        const dataDomain = domain;
        console.log('domain database' + this.relationshipSourceDropdown);
        this.counter = null;
        while (this.nodes.length > 0) {
            this.nodes.pop();
        }
        while (this.links.length > 0) {
            this.links.pop();
        }
        this.setJsonData(dataDomain);
        this.setDropDownNodes(this.ontologyDropdown);
        this.nodeLabel = dataDomain;
        this.clearPropertyList();
        this.clearRelForm();
    }

    addFieldValue(index) {
        if (this.fieldArray.length <= 200) {
            console.log(this.fieldArray);
            this.fieldArray.push(this.newAttribute);
            this.newAttribute = {};
        } else {

        }
    }

    addFieldValueRel(index) {
        if (this.fieldArrayRel.length <= 200) {
            this.fieldArrayRel.push(this.newAttribute);
            this.newAttribute = {};
        } else {

        }
    }

    deleteFieldValue(index) {
        this.fieldArray.splice(index, 1);
    }

    deleteFieldValueRel(index) {
        this.fieldArrayRel.splice(index, 1);
    }

    onEditCloseItems() {
        this.isEditItems = !this.isEditItems;
    }

    onEditCloseItemsRel() {
        this.isEditItemsRel = !this.isEditItemsRel;
    }

    clearNodeLabel() {
        this.nodeLabel = '';
    }

    clearPropertyList() {
        this.fieldArray.length = 0;
        this.fieldArray.push({name: 'name', value: ''});
        this.fieldArray.push({name: 'increase', value: 0.0});
        this.fieldArray.push({name: 'decrease', value: 0.0});
    }

    clearRelPropertyList() {
        this.fieldArrayRel.length = 0;
    }

    clearRelForm() {
        this.relSourceDropdown = 'select';
        this.relDirectionDropdown = 'nodirection';
        this.relDestinationDropdown = 'select';
        this.relType = '';
        this.clearRelPropertyList();
    }

    async reloadDropdowns() {
        await this.setDropDownNodes(this.ontologyDropdown);
    }


    addNodeRefresh() {
        alert('Node added successfully!!!');
        this.clearPropertyList();
        this.reload();
        this.reloadDropdowns();
    }

    async reload() {
        await this.getDomainDatabase(this.nodeLabel);
    }
    addRelationshipRefresh() {
        alert('Relationship added successfully');
        this.clearRelForm();
        this.reload();
    }


    async addNode() {
            const node_properties = [];
            const node_info = {};

            for (let i = 0; i < this.fieldArray.length; i++) {
                const node_prop = {'prop_name': this.fieldArray[i]['name'], 'prop_value': this.fieldArray[i]['value']};
                node_properties.push(node_prop)
            }
            const postbody = {
                'nodeInfo': {
                    'name': this.nodeLabel,
                    'properties': node_properties
                }
            };
            console.log(postbody);
            const addNodeUrl = this.apiUrl + '/node_info';
            const headers = new HttpHeaders();
            headers.append('Content-Type', 'application/json');
            return await this.http.post(addNodeUrl, postbody).toPromise()
                .then()
                .catch();
    }

    addNodeToDB() {
        if ((this.nodeLabel == null) || (this.nodeLabel  === '' )) {
            alert('Please insert a Node Label!')
        } else if (this.fieldArray.length === 0) {
            alert('Please insert the name of the node!')
        } else if (this.fieldArray[0].value === '') {
            alert('Please insert the name of the node!')
        } else if (this.fieldArray[1].value === '') {
            alert('Please insert the increase value of the node!')
        } else if (this.fieldArray[2].value === '') {
            alert('Please insert the decrease value of the node!')
        } else if (isNaN(parseFloat(this.fieldArray[1].value))) {
            alert('Please insert a valid increase value!')
        } else if (isNaN(parseFloat(this.fieldArray[2].value))) {
            alert('Please insert a valid decrease value!')
        } else {
            this.addNode();
            this.addNodeRefresh();
        }
    }

    addNodeCancel() {
        this.clearPropertyList();
    }

    addRelationshipCancel() {
        this.clearRelForm();
    }


    async addRelationship() {
            const rel_properties = [];
            const rel_info = {};

            for (let i = 0; i < this.fieldArrayRel.length; i++) {
                const rel_prop = {
                    'prop_name': this.fieldArrayRel[i]['name'],
                    'prop_value': this.fieldArrayRel[i]['value']
                };
                rel_properties.push(rel_prop)
            }
            const postbody = {
                'relationshipInfo': {
                    'rel_name': this.relType,
                    'source': {
                        'name': this.nodeLabel,
                        'properties': [{
                            'prop_name': 'name',
                            'prop_value': this.relSourceDropdown
                        }]
                    },
                    'destination': {
                        'name': this.nodeLabel,
                        'properties': [{
                            'prop_name': 'name',
                            'prop_value': this.relDestinationDropdown
                        }]
                    },
                    'rel_properties': rel_properties,
                    'direction': this.relDirectionDropdown
                }
            };
            const addRelUrl = this.apiUrl + '/rel_info';
            const headers = new HttpHeaders();
            headers.append('Content-Type', 'application/json');
            return await this.http.post(addRelUrl, postbody).toPromise()
                .then()
                .catch();
    }

    addRelationshipToDB() {
        if (this.relSourceDropdown === 'select') {
            alert('Please select a source node!');
        } else if ((this.relType == null) || this.relType === '') {
            alert('Please insert the relationship type!');
        } else if (this.relDirectionDropdown === 'nodirection') {
            alert('Please select a relationship direction!');
        } else if (this.relDestinationDropdown === 'select') {
            alert('Please select a destination node!');
        } else {
            this.addRelationship();
            this.addRelationshipRefresh();
        }
    }
    extractData(res: Response) {
        const body = res.json();
        return body || {};
    }

    handleErrorPromise(error: Response | any) {
        console.error(error.message || error);
    }
}
