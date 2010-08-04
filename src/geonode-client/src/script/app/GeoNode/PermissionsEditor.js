Ext.namespace("GeoNode");
GeoNode.PermissionsEditor = Ext.extend(Ext.util.Observable, {

    constructor: function(config) {
        Ext.apply(this, config);
        this.doLayout();
    },
   
    doLayout: function() {
        var render_to_el = Ext.get(this.renderTo);
        var the_pe = this;
        var pe_form = new Ext.FormPanel({
          width: 'auto',
          frame: true,
          autoHeight: true,
          bodyStyle: 'padding: 10px 10px 0 10px;',
          method: 'POST',
          buttons: [
            {text: gettext('Add user'), 
             iconCls: 'add-layers',
             handler: function() {
               var user_select = the_pe._make_user_combo('user', 'User');
               var perm_select = the_pe._make_perm_combo('perm', 'Permission', the_pe.permissions.levels[1][0]);
               var perm_popup = new Ext.Window({
                   width: 350,
                   autoHeight: true,
                   title: gettext('Create permission'),
                   plain: true,
                   modal: true,
                   items: new Ext.FormPanel({
                     frame: true,
                     autoHeight: true,
                     items: [user_select, perm_select]}),
                   buttons: [
                     {text: gettext('Cancel'),
                      handler: function() {
                        perm_popup.close();
                      }},
                     {text: gettext('Create'),
                      handler: function() {
                        var username = user_select.getValue();
                        var level = perm_select.getValue();
                        var combo = the_pe._make_perm_combo_for_user(username, level);
                        var existing = pe_form.get(combo.getId());
                        if (existing) {
                          existing.setValue(level);
                        }
                        else {
                          pe_form.add(combo);
                          pe_form.form.add(combo);
                          pe_form.doLayout();
                        }
                        perm_popup.close();
                     }}]
                 });
                 perm_popup.show();
               }
             }
           ]
        });
        pe_form.add(this._make_perm_combo('anonymous',
                                     gettext('Anyone'),
                                     this.permissions.anonymous, 3));
        pe_form.add(this._make_perm_combo('authenticated', 
                                     gettext('GeoNode Users'),
                                     this.permissions.authenticated));
        pe_form.add({ html: "<hr/>" });

        for (var i = 0; i < this.permissions.users.length; i++) {
          var username = this.permissions.users[i][0];
          var user_level = this.permissions.users[i][1];
          var combo = this._make_perm_combo_for_user(username, user_level);  
          pe_form.add(combo);
        }

        pe_form.add({ html: "<hr/>" });

        var userStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: '/accounts/ajax_lookup'
            }),
            reader: new Ext.data.JsonReader({
                root: 'users',
                totalProperty: 'count',
            }, [
                {name: 'username', type: 'string'}
            ])
        });

        pe_form.add(new Ext.form.ComboBox({
            name: 'name',
            fieldLabel: 'add user',
            displayField: 'username',
            store: userStore,
            minChars: 2
        }));

        pe_form.render(render_to_el);
    },
    
    _make_user_combo: function(name, label) {
      var combo_options = this.permissions.all_usernames.slice(0);
      cbo = new Ext.form.ComboBox({
        name: name,
        fieldLabel: label,
        allowBlank: false, 
        forceSelection: true,
        typeAhead: true,
        triggerAction: 'all',
        store: combo_options,
        value: combo_options[0]
      });
      return cbo;
    },
    
    _make_perm_combo: function(name, label, value, max) {
      var combo_options;
      if (max) {
        combo_options = this.permissions.levels.slice(0, max);
      }
      else {
        combo_options = this.permissions.levels.slice(0);
      }
      cbo = new Ext.form.ComboBox({
        id: 'cb_' + name,
        hiddenName: name,
        fieldLabel: label,
        allowBlank: false, 
        forceSelection: true,
        typeAhead: false,
        triggerAction: 'all',
        value: value,
        store: combo_options
      });
      return cbo;
    },

    _make_perm_combo_for_user: function(username, user_level) {
      return this._make_perm_combo('u_' + username + '_level',
                                   gettext("User") + " " + username,
                                   user_level);
    }
});