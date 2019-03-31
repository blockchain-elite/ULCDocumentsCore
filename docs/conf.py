def setup(sphinx):
    from pygments_lexer_solidity import SolidityLexer
    sphinx.add_lexer('Solidity', SolidityLexer())
