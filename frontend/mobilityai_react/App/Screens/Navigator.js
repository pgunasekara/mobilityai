import React from 'react';
import Icon from 'react-native-vector-icons/Entypo';
import Menu, {
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

/*
  Three line menu icon to be used for the Navigator Menu bar.
 */
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

/**
 * @param  {options} - Array of Json Objects, with the keys "title" and "handler". These are the items that get 
 * displayed when you press the Menu Icon. Each item has a title that is displayed and a handler that is called
 * when you press that option.
 * 
 * @return the Navigator with the options passed in as the options when you press the Menu Icon
 ***/
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