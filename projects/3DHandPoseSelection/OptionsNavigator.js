class Node
{
    constructor(name, parent, children)
    {
        this.name = name;
        this.parent = parent;
        this.children = children;
    }
}

class OptionsNavigator
{
  constructor(options, onSelect){    
    this.topDirectory = options;
    var currentNode = new Node("", options, options)
    this.currentNode = currentNode;
    this.nodes = {"":currentNode};
    this.onSelect = onSelect;
  }

  Navigate(name){
    // if selectable call select function
    if (typeof this.currentNode.children[name] == "string"){
        this.onSelect(this.currentNode.children[name]);
    }
    // if node doesnt exist create it and navigate to it
    else if (this.nodes[name] == undefined){
        var node = new Node(name, this.currentNode, this.currentNode.children[name]);
        this.nodes[name] = node;
        this.currentNode = node;
    }
    // if node exists navigate to it
    else if (this.nodes[name] != undefined){
        this.currentNode = this.nodes[name];
    }

    return this.currentDirectory;
  }

  Back()
  {
    if (this.currentNode.name != ""){
        this.currentNode = this.currentNode.parent;
    }
  }

  ParentNavigate(name){
    this.Back();
    this.Navigate(name);
  }

  Options()
  {
    return this.currentNode.children;
  }

  ParentOptions()
  {
    return this.currentNode.parent.children;
  }
}