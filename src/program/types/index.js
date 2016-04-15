import ArrayExpression from './ArrayExpression.js';
import ArrowFunctionExpression from './ArrowFunctionExpression.js';
import AssignmentExpression from './AssignmentExpression.js';
import BreakStatement from './BreakStatement.js';
import CallExpression from './CallExpression.js';
import ClassBody from './ClassBody.js';
import ClassDeclaration from './ClassDeclaration.js';
import ClassExpression from './ClassExpression.js';
import ContinueStatement from './ContinueStatement.js';
import ExportDefaultDeclaration from './ExportDefaultDeclaration.js';
import ForStatement from './ForStatement.js';
import ForInStatement from './ForInStatement.js';
import ForOfStatement from './ForOfStatement.js';
import FunctionDeclaration from './FunctionDeclaration.js';
import FunctionExpression from './FunctionExpression.js';
import Identifier from './Identifier.js';
import ImportSpecifier from './ImportSpecifier.js';
import ImportDefaultSpecifier from './ImportDefaultSpecifier.js';
import Literal from './Literal.js';
import LoopStatement from './shared/LoopStatement.js';
import MemberExpression from './MemberExpression.js';
import Property from './Property.js';
import ReturnStatement from './ReturnStatement.js';
import Super from './Super.js';
import TaggedTemplateExpression from './TaggedTemplateExpression.js';
import TemplateElement from './TemplateElement.js';
import TemplateLiteral from './TemplateLiteral.js';
import ThisExpression from './ThisExpression.js';
import UpdateExpression from './UpdateExpression.js';
import VariableDeclaration from './VariableDeclaration.js';
import VariableDeclarator from './VariableDeclarator.js';

export default {
	ArrayExpression,
	ArrowFunctionExpression,
	AssignmentExpression,
	BreakStatement,
	CallExpression,
	ClassBody,
	ClassDeclaration,
	ClassExpression,
	ContinueStatement,
	DoWhileStatement: LoopStatement,
	ExportDefaultDeclaration,
	ForStatement,
	ForInStatement,
	ForOfStatement,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	ImportSpecifier,
	ImportDefaultSpecifier,
	Literal,
	MemberExpression,
	Property,
	ReturnStatement,
	Super,
	TaggedTemplateExpression,
	TemplateElement,
	TemplateLiteral,
	ThisExpression,
	UpdateExpression,
	VariableDeclaration,
	VariableDeclarator,
	WhileStatement: LoopStatement
};
