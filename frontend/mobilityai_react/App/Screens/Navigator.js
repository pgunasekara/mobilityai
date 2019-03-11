import React from 'react';
import Icon from 'react-native-vector-icons/Entypo';
import Menu, {
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

const MenuIcon = () => <Icon 
    name='dots-three-vertical' 
    size={25} 
    color='#000' 
    style={{ marginRight: 10 }}
  />;

const optionsStyles = {
  optionTouchable: {
    activeOpacity: 40,
  },
  optionWrapper: {
    marginTop: 5,
    marginBottom: 5
  },
  optionText: {
    color: 'black',
    fontSize: 17
  },
};

const NavigatorMenu = ({options}) => {
	const renderedOptions = options.map((opt,idx) => <MenuOption key={idx} onSelect={opt.handler} text={opt.title} />)

	return (
		<Menu>
			<MenuTrigger>
				<MenuIcon />
		    </MenuTrigger>
		    <MenuOptions customStyles={optionsStyles}>
		      {renderedOptions}
		    </MenuOptions>
		</Menu>
	);
}

export default NavigatorMenu;