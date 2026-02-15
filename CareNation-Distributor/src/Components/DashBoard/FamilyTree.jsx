
import "../../styles/FamilyTree.css";

const FamilyNode = ({ member }) => {
  return (
    <div className="tree-level">
      <div className="tree-node">{member.name}</div>

      {member.children && member.children.length > 0 && (
        <div className="tree-children-wrapper">
          {/* vertical line down from parent */}
          <div className="tree-line-vertical"></div>

          {/* horizontal line connecting children */}
          <div className="tree-children">
            {member.children.map((child, index) => (
              <div className="tree-child" key={index}>
                {/* line from horizontal to node */}
                <div className="tree-line-down"></div>
                <FamilyNode member={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function FamilyTree() {
  const data = {
    name: "Grandparent",
    children: [
      {
        name: "Parent 1",
        children: [
          { name: "Child 1" },
          { name: "Child 2" },
        ],
      },
      {
        name: "Parent 2",
        children: [
          { name: "Child 3" },
        ],
      },
    ],
  };

  return <div className="tree-container"><FamilyNode member={data} /></div>;
}
