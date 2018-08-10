class Node {
    constructor (aggFunc) {
        this.children = new Map()
        this.rawData = []
        this.aggFunc = aggFunc
        this.cache = false
    }
    push () {
        this.rawData.push(...arguments)
    }
    
    aggData (MEASURES = []) {
        if (!this.cache) {
            this._aggData = this.aggFunc(this.rawData, MEASURES)
            this.cache = true
        }
        return this._aggData
    }
}

class momentCube {
    constructor (props) {
        this.aggFunc = props.aggFunc
        this.FACT_TABLE = props.FACT_TABLE
        this.DIMENSIONS = props.DIMENSIONS
        this.MEASURES = props.MEASURES
    }

    buildTree () {
        let tree = new Node(this.aggFunc)
        let len = this.FACT_TABLE.length, i
        for (i = 0; i < len; i++) {
            this.insertNode(this.FACT_TABLE[i], tree, 0)
        }
        this.tree = tree
        return tree
    }

    insertNode (record, node, level) {
        if (level === this.DIMENSIONS.length) {
            node.push(record)
        } else {
            let member = record[this.DIMENSIONS[level]]
            if (!node.children.has(member)) {
                node.children.set(member, new Node(this.aggFunc))
            }
            this.insertNode(record, node.children.get(member), level + 1)
        }
    }

    aggTree (node = this.tree) {
        let children = node.children.values()
        for (let child of children) {
            let i, data = this.aggTree(child).rawData;
            let len = data.length;
            for (i = 0; i < len; i++) {
                node.rawData.push(data[i])
            }
        }
        node.aggData(this.MEASURES)
        return node
    }
}


export default momentCube
